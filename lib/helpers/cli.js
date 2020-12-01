// libs
const config = require('config');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');

// helpers
const logger = require('./logger');

// module
function CLI() {
  logger.debug('Helper function cli.constructor called.');
  this.hr = new inquirer.Separator();
  console.log(this.instance);
}

CLI.prototype.title = function title() {
  logger.debug('Helper function cli.title called.');
  const titleText = chalk.green(figlet.textSync(config.get('application.title'), {
    horizontalLayout: 'full',
  }));
  return titleText;
}

CLI.prototype.heading = function heading(title) {
  logger.debug('Helper function cli.heading called.');
  const titleText = chalk.green(figlet.textSync(title, {
    horizontalLayout: 'full',
  }));
  return titleText;
}

CLI.prototype.alertHeading = function alertHeading(title) {
  logger.debug('Helper function cli.alertHeading called.');
  const titleText = chalk.red(figlet.textSync(title, {
    horizontalLayout: 'full',
  }));
  return titleText;
}

CLI.prototype.menu = async function menu() {
  logger.debug('Helper function cli.menu called.');
  return inquirer.prompt({
    name: 'menu',
    type: 'rawlist',
    message: 'Choose an Action:\n',
    choices: [
      'Encrypt Message',
      'Decrypt Message',
      'Exit'
    ]
  });
}

CLI.prototype.results = function results(message) {
  logger.debug('Helper function cli.results called.');
  return chalk.green(message);
}

CLI.prototype.bold = function bold(message) {
  logger.debug('Helper function cli.bold called.');
  return chalk.bold(message);
}

CLI.prototype.error = function error(message) {
  logger.debug('Helper function cli.error called.');
  return chalk.bold.red(message);
}

CLI.prototype.ask = function ask(inputSchema) {
  logger.debug('Helper function cli.ask called.');
  return inquirer.prompt(inputSchema);
}

CLI.prototype.advisory = function advisory(message) {
  logger.debug('Helper function cli.advisory called.');
  return chalk.red(message);
}

module.exports = CLI;
