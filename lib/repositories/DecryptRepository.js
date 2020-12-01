// libs
const clear = require('clear');
const config = require('config');

// helpers
const { logger, pgp } = require('../helpers');
const { decryptMessage } = require('../helpers/pgp');

// module
function Decrypt (cli) {
  logger.debug('Function Decrypt.constructor called.');
  if (!cli) {
    throw new Error('Missing CLI object.');
  }
  this.cli = cli;
}

Decrypt.prototype.prompt = async function prompt () {
  logger.debug('Repository function Decrypt.prompt called.');
  let promptResults;
  let questions = [{
    name: 'payload',
    type: 'editor',
    message: 'Message to decrypt:'
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

Decrypt.prototype.action = async function action (args) {
  logger.debug('Repository function Decrypt.action called.');
  
  // assign values
  this.payload = args.payload;
  this.passphrase = args.passphrase;

  // basic validation
  if (!args.payload || args.payload.length === 0) {
    throw new Error('Invalid payload to encrypt.');
  }
  if (!args.passphrase || args.passphrase.length === 0) {
    throw new Error('Invalid private key passphrase.');
  }
  
  // perform encryption
  let allPublicKeys = [];
  let privateKeys;
  let publicKeys;
  let decryptedPrivateKey;
  let decryptedMessage;

  try {
    // get all recipients/senders' public keys
    allPublicKeys = Object.keys(config.get('crypto.recipients')).map(x => Buffer.from(config.get('crypto.recipients')[x], 'base64'));
    // load keys
    logger.debug('Loading private key...');
    privateKeys = await pgp.readArmoredKey(Buffer.from(config.get('crypto.privateKey'), 'base64').toString('utf-8'));
    
    logger.debug('Loading public key...');
    publicKeys = await pgp.readArmoredKey(allPublicKeys.toString('utf-8'));

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
    logger.debug('Decrypting file...');
    const pgpOptions = {
      publicKeys: publicKeys.keys,
      privateKeys: decryptedPrivateKey.key,
    };
    decryptedMessage = await pgp.decryptMessage(Buffer.from(this.payload), pgpOptions);
    console.log(decryptedMessage);
    if (!decryptedMessage.data) {
      throw new Error('Unspecified error has occurred while trying to decrypt file.');
    }
    return decryptedMessage.data;
  } catch (ex) {
    throw ex;
  }
};

module.exports = Decrypt;
