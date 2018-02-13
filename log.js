const log = require('loglevel');
const chalk = require('chalk');

module.exports = {
  setLevel(level) {
    log.setLevel(log.levels[level] || log.levels.INFO);
  },
  debug(text) {
    log.debug(chalk.gray(`[debug] ${text}`));
  },
  info(text) {
    log.info(chalk.blue(`[info] ${text}`));
  },
  warn(text) {
    log.warn(chalk.yellow(`[warn] ${text}`));
  },
  error(text) {
    log.error(chalk.red(`[error] ${text}`));
  },
};
