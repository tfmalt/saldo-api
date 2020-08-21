import { users, keys, accounts, expenses } from './config.json';

interface UsersMap {
  [key: string]: RegExp;
}

type UsersList = string[][];

function __prepareUsers(users: UsersList) {
  const map: UsersMap = {};

  users.forEach((u: string[]) => {
    map[u[0]] = new RegExp(u[1], 'ui');
  });

  return map;
}

const __users = __prepareUsers(users);

const config = {
  users: __users,
  keys,
  accounts,
  expenses
};

export default config;
export { config, __users as users, keys, accounts, expenses };
