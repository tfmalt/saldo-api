import { Express, Request, Response, NextFunction } from 'express';
import express from 'express';
import helmet from 'helmet';
import winston from 'winston';
import cors from 'cors';
import expressWinston from 'express-winston';
import * as sb from 'node-sbanken';
import { users, accounts, expenses } from './lib/Config';
import apikeys from './lib/apikeys';
import minilog from './lib/minilog';
import chalk from 'chalk';

import { name, version, author } from './package.json';
import xFrameOptions from 'helmet/dist/middlewares/x-frame-options';

const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';
const logger = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.colorize(), winston.format.cli()),
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{req.headers}}',
  expressFormat: true,
  colorize: false
});

const app: Express = express();

app.use(helmet());
app.use(logger);
app.use(apikeys);
app.disable('x-powered-by');

minilog.info(chalk`Starting {cyan ${name}} version {cyan ${version}} by {yellow ${author}}`);

if (!process.env.SBANKEN_CLIENTID || !process.env.SBANKEN_SECRET) {
  minilog.error('sbanken credentials not configured properly. exiting.');
  process.exit(0);
}

const sbanken = new sb.Sbanken(
  {
    clientId: process.env.SBANKEN_CLIENTID,
    secret: process.env.SBANKEN_SECRET
    // customerId: process.env.SBANKEN_CUSTOMERID || ''
  },
  { verbose: false }
);

minilog.info(chalk`Initalized {cyan Sbanken SDK} version {cyan ${sbanken.version}}`);

minilog.debug('Loaded users:');
Object.keys(users).forEach((user) => minilog.debug(`  - ${user}`));

app.get('/', (req, res) => {
  res.json({ message: 'hello world' });
});

function handleBadRequest(res: Response, message = 'This was a bad request') {
  return res.status(400).json({ error: 'Bad Request', message }).end();
}

function handleServerError(res: Response) {
  return res
    .status(502)
    .json({
      error: 'Bad Gateway',
      message: 'A result from an upstream server returned an invalid response'
    })
    .end();
}

/**
 * API endpoint for routing to the budget expenses api.
 */
const corsOpts = cors({});
app.options('/budget/expenses', corsOpts);
app.get('/budget/expenses', cors(), (req: Request, res: Response) => {
  return res
    .set('Location', `${expenses.url}?y=${req.query.y}&m=${req.query.m}&apikey=${expenses.key}`)
    .set('Access-Control-Allow-Origin', '*')
    .status(302)
    .end();
});

/**
 * Fetching the balance from the accounts for a user.
 */
app.get('/balance', (req, res) => {
  const user = req.get('x-consumer-username');

  if (typeof user === 'undefined' || !users.hasOwnProperty(user)) {
    minilog.warn('400 missing x-consumer-username header');
    res
      .status(400)
      .json({
        error: 'Wrong or Missing header',
        message: 'The X-Consumer-Username header must be set correctly'
      })
      .end();
    return;
  }

  sbanken
    .accounts()
    .then((data) => data.items.filter((i) => i.name.match(users[user])))
    .then((data) => {
      return data.map((i: any) => {
        delete i.ownerCustomerId;
        delete i.creditLimit;
        return i;
      });
    })
    .then((data) => {
      res.json(data).end();
    });
});

/**
 * Endpoint to fetch transactions for a give account - or set of accounts
 * Will not work with any account id.
 */
app.get('/transactions/:account', async (req, res) => {
  const account = req.params.account;

  console.log('params:', req.params);
  console.log('query', req.query);
  console.log('account:', account);

  if (account !== 'felles') {
    return handleBadRequest(res, 'Invalid parameter passed in URL');
  }

  const options = {
    from: req.query.hasOwnProperty('from') ? new Date(req.query.from as string) : new Date(),
    to: req.query.hasOwnProperty('to') ? new Date(req.query.to as string) : undefined // new Date()
  };

  if (typeof options.to !== 'undefined' && options.to > new Date()) {
    return handleBadRequest(res, 'To date cannot be greater than todays date');
  }

  try {
    const data = {
      version,
      name,
      transactions: account,
      options,
      items: (await getTransactions(options))
        .flat()
        .sort((a, b) => (new Date(a.accountingDate) > new Date(b.accountingDate) ? 1 : -1))
    };
    res.set('Cache-Control', 'public, s-maxage: 1200, max-age: 1200').status(200).json(data).end();
  } catch (err) {
    handleServerError(res);
  }
});

async function getTransactions(options: { from: Date; to?: Date }): Promise<any[]> {
  const accountlist = (await sbanken.accounts()).items;
  const result = accounts.felles.map(async (id: string) => {
    const tOptions: sb.TransactionsOptions = { accountId: id, from: options.from };
    if (options.to instanceof Date) {
      tOptions.to = options.to;
    }
    const data = await sbanken.transactions(tOptions);

    return data.items.map((t: any): any => {
      const account = accountlist.find((i: sb.Account) => i.accountId === id);
      t.accountName = typeof account === 'undefined' ? '' : account.name;
      return t;
    });
  });

  return Promise.all(result);
}

/**
 * default route
 */
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', message: 'This endpoint does not exist' }).end();
});

app.listen(port, host, () => {
  minilog.info(chalk`Server Running: {yellow http://${host}:${port}}. Waiting for connections...`);
});
