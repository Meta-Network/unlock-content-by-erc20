import { NextApiRequest, NextApiResponse } from "next"
import { decrypt, encrypt, getRandomSecretKey } from "../../encryption"
import { EncryptedSnippet, Snippet } from "../../typing"
import { uploadToPublic } from "../../utils/ipfs"

type SimpleDecryptBody = {
    encrypted: EncryptedSnippet;
    privateKey: string;
}

type UploadReturn = { 
    parseToObj: any; 
}

async function SimpleDecrypt(req: NextApiRequest, res: NextApiResponse<UploadReturn>) {
    const { encrypted, privateKey } = req.body as SimpleDecryptBody
    const decrptytedStr = decrypt(encrypted, privateKey)
    const parseToObj = JSON.parse(decrptytedStr);
    return res.status(201).json({ parseToObj })
}

export default SimpleDecrypt;