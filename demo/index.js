const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PUBLIC_KEY_FILE_NAME = ".public_key";
const PRIVATE_KEY_FILE_NAME = ".private_key";

// Generating key files
function generateKeyFiles() {
  const keyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 520,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: "",
    },
  });

  // Creating public and private key file
  fs.writeFileSync(path.join(__dirname, PUBLIC_KEY_FILE_NAME), keyPair.publicKey);
  fs.writeFileSync(path.join(__dirname, PRIVATE_KEY_FILE_NAME), keyPair.privateKey);
}

// Generate keys
generateKeyFiles();

// Reading private key file
var PRIVKEY = fs.readFileSync(path.join(__dirname, PRIVATE_KEY_FILE_NAME), "utf8");

// Reading public key file
var PUBKEY = fs.readFileSync(path.join(__dirname, PUBLIC_KEY_FILE_NAME), "utf8");

// Defining my msg
var myMSG = "I am encrypted!";
console.log("Original msg is:" + myMSG);

// RSA PRIVATE ENCRYPT -> PUBLIC DECRYPT
function privENC_pubDEC(originMSG) {
  console.info('PRIVKEY', PRIVKEY)
  console.info('PUBKEY', PUBKEY)
  // Encrypting msg with privateEncrypt method
  let encmsg = crypto.privateEncrypt({
    key: PRIVKEY,
    passphrase: ''
  }, Buffer.from(originMSG, "utf8"))
    .toString("base64");

  // Decrypting msg with publicDecrypt method
  let msg = crypto.publicDecrypt(PUBKEY, Buffer.from(encmsg, "base64"));

  console.log();

  // Prints encrypted msg
  console.log("Encrypted with private key:" + encmsg);

  console.log();

  // Prints decrypted msg
  console.log("Decrypted with public key:" + msg.toString());
}

// Calling privENC_pubDEC() method
privENC_pubDEC(myMSG);
