import { utils } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { encrypt, getRandomSecretKey } from "../../encryption"
import { EncryptedSnippet, Snippet } from "../../typing"
import { uploadToPublic } from "../../utils/ipfs"

type UploadReturn = { 
    encrypted: EncryptedSnippet, hash: string, privateKey: string 
}

async function upload(req: NextApiRequest, res: NextApiResponse<UploadReturn>) {
    const privateKey = getRandomSecretKey()
    // @todo: use sig to replace the `owner`
    const { content, title, owner } = req.body
    const checksumedAuthorWallet = utils.getAddress(owner);
    const encrypted = encrypt(JSON.stringify({
        content,
        timestamp: Date.now(),
        title,
        version: '20210604',
    } as Snippet), privateKey)
    encrypted.owner = checksumedAuthorWallet;
    const hash = await uploadToPublic(JSON.stringify(encrypted))
    return res.status(201).json({ encrypted, hash, privateKey })
}

export default upload;