const express = require('express');
const helmet = require('helmet');
const winston = require('winston');
const cors = require('cors');
const expressWinston = require('express-winston');
const Sbanken = require('node-sbanken');
const { users, accounts, expenses } = require('./config');
const apikeys = require('./apikeys');
const minilog = require('./minilog');
const chalk = require('chalk');

const { name, version, author } = require('../package');
const port = process.env.PORT || 3000;
const host = '0.0.0.0';
const logger = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.cli()
  ),
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{req.headers}}',
  expressFormat: true,
  colorize: false
});

const app = express();

app.use(helmet());
app.use(logger);
app.use(apikeys);
app.disable('x-powered-by');

minilog.info(
  chalk`Starting {cyan ${name}} version {cyan ${version}} by {yellow ${author}}`
);

if (
  !process.env.SBANKEN_CLIENTID ||
  !process.env.SBANKEN_SECRET ||
  !process.env.SBANKEN_USERID
) {
  minilog.error('sbanken credentials not configured properly. exiting.');
  process.exit(0);
}

const sbanken = new Sbanken(
  {
    clientId: process.env.SBANKEN_CLIENTID,
    secret: process.env.SBANKEN_SECRET,
    userId: process.env.SBANKEN_USERID
  },
  { verbose: true }
);

minilog.info(
  chalk`Initalized {cyan Sbanken SDK} version {cyan ${sbanken.version}}`
);

minilog.debug('Loaded users:');
Object.keys(users).forEach((user) => minilog.debug(`  - ${user}`));

app.get('/', (req, res) => {
  res.json({ message: 'hello world' });
});

function handleBadRequest(res, message = 'This was a bad request') {
  return res.status(400).json({ error: 'Bad Request', message }).end();
}

function handleServerError(res) {
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
app.options('/budget/expenses', cors());
app.get('/budget/expenses', cors(), (req, res) => {
  return res
    .set(
      'Location',
      `${expenses.url}?y=${req.query.y}&m=${req.query.m}&apikey=${expenses.key}`
    )
    .set('Access-Control-Allow-Origin', '*')
    .status(302)
    .end();
});

/**
 * Fetching the balance from the accounts for a user.
 */
app.get('/balance', (req, res) => {
  const user = req.headers['x-consumer-username'];
  minilog.debug(req.headers);

  if (!users.hasOwnProperty(user)) {
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
    .then((data) => {
      return data.items.filter((i) => i.name.match(users[user].filter));
    })
    .then((data) => {
      return data.map((i) => {
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
    from: req.query.hasOwnProperty('from')
      ? new Date(req.query.from)
      : new Date(),
    to: req.query.hasOwnProperty('to') ? new Date(req.query.to) : new Date()
  };

  if (options.to > new Date()) {
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
        .sort((a, b) =>
          new Date(a.accountingDate) > new Date(b.accountingDate) ? 1 : -1
        )
    };

    res.status(200).json(data).end();
  } catch (err) {
    handleServerError(res);
  }
});

async function getTransactions(options) {
  const accountlist = (await sbanken.accounts()).items;
  const result = accounts.felles.map(async (id) => {
    const data = await sbanken.transactions({
      accountId: id,
      from: options.from,
      to: options.to
    });

    //
    return data.items.map((t) => {
      t.accountName = accountlist.find((i) => i.accountId === id).name;
      return t;
    });
  });

  return Promise.all(result);
}

/**
 * default route
 */
app.use((req, res, next) => {
  res
    .status(404)
    .json({ error: 'Not Found', message: 'This endpoint does not exist' })
    .end();
});

app.listen(port, host, () => {
  minilog.info(
    chalk`Server Running: {yellow http://${host}:${port}}. Waiting for connections...`
  );
});
