const { version } = require('../package.json');

module.exports = {
  version,
  users: {
    // Add users here
  },
  keys: [
    // add api keys here
    'add_valid_apikey_here'
  ],
  accounts: {
    // add accounts you want to fetch here.
  },
  expenses: {
    key: 'expense_key',
    url: 'expense_url'
  }
};
