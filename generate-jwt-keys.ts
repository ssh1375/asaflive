import crypto from 'crypto';
import fs from 'fs';
import path from 'path';


// 1. Generate RSA keys
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log(privateKey);
// 2. Format for .env (replace real newlines with literal '\n')
const formattedPrivateKey = privateKey.replace(/\n/g, '\\n');
const formattedPublicKey = publicKey.replace(/\n/g, '\\n');

// 3. Prepare the string to append
const envContent = `\nJWT_PRIVATE="${formattedPrivateKey}"\nJWT_PUBLIC="${formattedPublicKey}"\n`;

// 4. Append to .env file in the current working directory
const envPath = path.join(process.cwd(), '.env');
fs.appendFileSync(envPath, envContent, { encoding: 'utf8' });

console.log('Keys generated and appended to .env successfully!');
