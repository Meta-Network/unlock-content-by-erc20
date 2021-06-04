import { NextApiRequest, NextApiResponse } from "next"
import { encrypt, getRandomSecretKey } from "../../encryption"
import { EncryptedSnippet, Snippet } from "../../typing"
import { uploadToPublic } from "../../utils/ipfs"

type UploadReturn = { 
    encrypted: EncryptedSnippet, hash: string, privateKey: string 
}

async function upload(req: NextApiRequest, res: NextApiResponse<UploadReturn>) {
    const privateKey = getRandomSecretKey()
    const { content, title } = req.body
    const encrypted = encrypt(JSON.stringify({
        content,
        timestamp: Date.now(),
        title,
        version: '20210604'
    } as Snippet), privateKey)
    const hash = await uploadToPublic(JSON.stringify(encrypted))
    return res.status(201).json({ encrypted, hash, privateKey })
}

export default upload;