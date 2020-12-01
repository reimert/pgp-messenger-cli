const config = require('config');
const winston = require('winston');

module.exports = winston.createLogger({
  level: process.env.LOG_LEVEL || (config.get('application.logLevel') || 'info'),
  transports: [
    new winston.transports.Console(),
  ],
});
