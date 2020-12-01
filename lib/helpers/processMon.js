// helpers
const logger = require('./logger');

module.exports = () => {
  // register termination codes
  process.on('SIGINT', (code) => {
    logger.info(`Process has terminated with code ${code}.`);
    process.exit(0);
  });

  process.on('SIGTERM', (code) => {
    logger.info(`Process has terminated with code ${code}`);
    process.exit(0);
  });

  // register application exit
  process.on('exit', (code) => {
    logger.info(`Service has exited with code ${code}.`);
  });

  // catch unhandled exceptions
  process.on('uncaughtException', (err) => {
    logger.info('Process has handled an uncaught exception.');
    logger.error(err.message);
    logger.debug(err.stack);
    process.exit(1);
  });

  // catch unresolved promises
  process.on('unhandledRejection', (err) => {
    logger.info('Process has handled an unresolved rejection.');
    logger.error(err.message);
    logger.debug(err.stack);
    process.exit(1);
  });
};
