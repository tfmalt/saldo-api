/**
 * A simple wrapper object ot make verbose output prettier.
 */
import chalk from 'chalk';

const __date = (): string => new Date().toJSON();

export default {
  info: (...msgs: (string | number | object)[]) =>
    console.info(
      __date(),
      chalk.blue('info'),
      msgs.reduce((a, b) => a + ' ' + b)
    ),
  debug: (...msgs: (string | number | object)[]) =>
    console.debug(
      __date(),
      chalk.green('debug'),
      msgs.reduce((a, b) => a + ' ' + b)
    ),
  warn: (...msgs: (string | number | object)[]) =>
    console.warn(
      __date(),
      chalk.yellow('warning'),
      msgs.reduce((a, b) => a + ' ' + b)
    ),
  error: (...msgs: (string | number | object)[]) =>
    console.error(
      __date(),
      chalk.red('error'),
      msgs.reduce((a, b) => a + ' ' + b)
    ),
  log: (...msgs: (string | number | object)[]) =>
    console.log(
      __date(),
      chalk.dim('log'),
      msgs.reduce((a, b) => a + ' ' + b)
    )
};
