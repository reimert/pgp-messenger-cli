// libs
const clear = require('clear');
const config = require('config');

// helpers
const { logger, pgp } = require('../helpers');

// module
function Encrypt (cli) {
  logger.debug('Function Encrypt.constructor called.');
  if (!cli) {
    throw new Error('Missing CLI object.');
  }
  this.cli = cli;
}

Encrypt.prototype.prompt = async function prompt () {
  logger.debug('Repository function encryptRepository.prompt called.');
  let promptResults;
  let questions = [{
    name: 'recipient',
    type: 'input',
    message: 'Recipient E-mail Address:'
  },
  {
    name: 'payload',
    type: 'input',
    message: 'Message to encrypt:'
  },
  {
    name: 'passphrase',
    type: 'password',
    message: 'Enter your private key passphrase:',
    mask: '*'
  }];
  try {
    // prompt questions
    clear();
    promptResults = await this.cli.ask(questions);
    
    // action answers
    const res = await this.action(promptResults);
    return res;
  } catch (ex) {
    logger.error(ex.message);
    logger.debug(ex.stack);
    throw new Error(ex);
  }
};

Encrypt.prototype.action = async function action (args) {
  logger.debug('Repository function encryptRepository.action called.');
  
  // assign values
  this.payload = args.payload;
  this.passphrase = args.passphrase;
  if (args.recipient) {
    this.recipient = args.recipient.toLowerCase().trim();
  }

  // basic validation
  if (!args.recipient || args.recipient.length === 0) {
    throw new Error('Invalid recipient.')
  }
  if (!args.payload || args.payload.length === 0) {
    throw new Error('Invalid payload to encrypt.');
  }
  if (!args.passphrase || args.passphrase.length === 0) {
    throw new Error('Invalid private key passphrase.');
  }

  // validate recipient public key
  if (!config.get('crypto.recipients')[this.recipient]) {
    throw new Error('Recipient could not be found.');
  }
  
  // perform encryption
  let privateKeys;
  let publicKeys;
  let decryptedPrivateKey;

  try {
    // load keys
    logger.debug('Loading private key...');
    privateKeys = await pgp.readArmoredKey(Buffer.from(config.get('crypto.privateKey'), 'base64').toString('utf-8'));
    
    logger.debug('Loading public key...');
    publicKeys = await pgp.readArmoredKey(Buffer.from(config.get('crypto.recipients')[this.recipient], 'base64').toString('utf-8'));

    if (!privateKeys) {
      throw new Error('Invalid private key.');
    }

    if (!publicKeys) {
      throw new Error('Invalid public key.');
    }

    // decrypt private key
    logger.debug('Decrypting private key...');
    try {
      decryptedPrivateKey = await pgp.decryptPrivateKey(privateKeys.keys[0], this.passphrase);
    } catch (ex) {
      throw new Error('Incorrect passhprase supplied.');
    }

    // decrypt file
    logger.debug('Encrypting file...');
    const pgpOptions = {
      publicKeys: publicKeys.keys,
      privateKeys: decryptedPrivateKey.key,
    };
    return pgp.encryptMessage(Buffer.from(this.payload.trim()), pgpOptions);
  } catch (ex) {
    throw ex;
  }
};

module.exports = Encrypt;
