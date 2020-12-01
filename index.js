#!/usr/bin/env node
// libs
const clear = require('clear');

// helpers
const { logger, CLI, processMon, pgp } = require('./lib/helpers');

// init process monitor
processMon();

// module
const cli = new CLI();

// repositories
const { EncryptRepository, DecryptRepository } = require('./lib/repositories');

// instantiate repositories
const encrypt = new EncryptRepository(cli);
const decrypt = new DecryptRepository(cli);

async function run() {
  
  logger.info('CLI Application started.');
  // clear stdout
  clear();
  console.log(`${cli.title()}`);
  const list = await cli.menu();

  if (list.menu) {
    clear();
    console.log(cli.title());
    let listOption;
    switch(list.menu) {
      case 'Encrypt Message':
        try {
          listOption = await encrypt.prompt();
          clear();
          console.log(cli.heading('Done!'))
          console.log(cli.bold('Encrypted Message:\n'));
          console.log(cli.results(listOption));
        } catch (ex) {
          console.log(cli.alertHeading('Error!'))
          console.log(cli.error(ex.message));
          process.exit(1);
        }
        break;
      case 'Decrypt Message':
        try {
          listOption = await decrypt.prompt();
          clear();
          console.log(cli.heading('Done!'))
          console.log(cli.bold('Decrypted Message:\n'));
          console.log(cli.results(listOption));
        } catch (ex) {
          console.log(cli.alertHeading('Error!'))
          console.log(cli.error(ex.message));
          process.exit(1);
        }
        break;
      case 'Exit':
        clear();
        process.exit(0);
      default:
        console.log(cli.advisory('Invalid Option.'));
    }
  }
};

run();