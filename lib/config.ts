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
    'martha@malt.no': { filter: new RegExp('marthas', 'ui') },
    'edith@malt.no': { filter: new RegExp('ediths', 'ui') },
    'thomas@malt.no': { filter: new RegExp('', 'ui') }
  },
  keys: [
    '// Add valid api keys here when running docker image',
    '9d3f94a0912f06b10acaf6a92cb22d2bb49c69f3cf178f1ae7da403c',
    'testing'
  ],
  accounts: {
    felles: [
      '390BB04482D935E849B63F38B3A70B51', // felles brukskonto
      '92C360DADDEE5CD09A3906B4ABCC05D9', // visa kredittkort
      '7F79CB42E93391536AC90B9499FAF2D8', // felles brukskonto
      '56AF698C5521D8D61DBF4D60C420762D' // felles regningskonto
    ]
  },
  expenses: {
    key: 'key',
    url: 'url'
  }
};

const { users, keys, accounts, expenses } = config;
export { config, users, keys, accounts, expenses };
