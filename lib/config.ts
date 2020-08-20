import { version } from '../package.json';

interface ConfigUserList {
  [key: string]: any;
}

interface ConfigAccountList {
  felles: Array<string>;
}

interface ConfigExpensesList {
  key: string;
  url: string;
}

interface Config {
  version: string;
  keys: Array<string>;
  users: ConfigUserList;
  accounts: ConfigAccountList;
  expenses: ConfigExpensesList;
}

const config: Config = {
  version,
  users: {
    // Add users here"
  },
  keys: [
    // Add valid api keys here when running docker image
  ],
  accounts: {
    felles: [
      // add account ids here
    ]
  },
  expenses: {
    key: 'key',
    url: 'url'
  }
};

const { users, keys, accounts, expenses } = config;
export { config, users, keys, accounts, expenses };
