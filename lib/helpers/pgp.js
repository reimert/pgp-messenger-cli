// libs
const openpgp = require('openpgp');

// helpers
const logger = require('./logger');

module.exports = (() => {
  const readMessage = (cipherText) => {
    logger.debug('Helper function pgp.readMessage called.');
    if (!cipherText || cipherText.length === 0) {
      throw new Error('Invalid cipher text supplied.');
    }
    const message = openpgp.message.readArmored(cipherText);
    return message;
  };

  const readArmoredKey = async (armoredBuffer) => openpgp.key.readArmored(armoredBuffer.toString('utf-8'));

  const decryptPrivateKey = async (privateKey, passphrase) => openpgp.decryptKey({
    privateKey,
    passphrase,
  });

  const decryptMessage = async (cipherText, pgpOptions) => {
    logger.debug('Helper function pgp.decryptMessage called.');
    const message = await readMessage(cipherText);
    const options = Object.assign(pgpOptions, {
      message,
    });
    
    // decrypt payload
    console.log(options);
    return openpgp.decrypt(options);
  };

  const encryptMessage = async (plainTextPayload, pgpOptions) => {
    const options = Object.assign(pgpOptions, {
      message: openpgp.message.fromBinary(plainTextPayload),
    });
    
    // encrypt payload
    const { data } = await openpgp.encrypt(options);
    return data;
  };

  return {
    decryptMessage,
    encryptMessage,
    readArmoredKey,
    decryptPrivateKey,
  };
})();
