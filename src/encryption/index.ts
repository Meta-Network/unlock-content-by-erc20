import crypto from 'crypto';
import { EncryptedSnippet } from '../typing';

const algorithm = 'aes-256-ctr';

export const encrypt = (text: string, secretKey: string) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    } as EncryptedSnippet;
};

export const decrypt = (hash: EncryptedSnippet, secretKey: string) => {

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

export const getRandomSecretKey = (length = 16) => {
    return crypto.randomBytes(length).toString('hex');
}
