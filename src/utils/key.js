const CryptoJS = require('crypto-js')
const debug = require('debug')('app:crypto');

module.exports = function (secret) {
  let ciphertext
  (async function generateCipher() {
    try {
      //Encrypt
      ciphertext = CryptoJS.AES.encrypt(secret, 'secret key 123').toString();
      debug(ciphertext)
      // Decrypt
      const bytes = await CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      debug(originalText)
    } catch (err) {
      debug(err)
    }
  }());
  return ciphertext
}