import { NextApiRequest, NextApiResponse } from "next"
import { decrypt } from "../../encryption"
import { EncryptedSnippet } from "../../typing"

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