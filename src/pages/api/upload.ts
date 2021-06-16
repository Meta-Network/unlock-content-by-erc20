import { utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { WorkerKV } from "../../constant/kvclient";
import { encrypt, getRandomSecretKey } from "../../encryption";
import { EncryptedSnippet, Snippet, UploadReturn } from "../../typing";
import { uploadToPublic } from "../../utils/ipfs";
import { verifyRecaptcha } from "../../utils/verifyRecaptcha";

async function upload(
  req: NextApiRequest,
  res: NextApiResponse<UploadReturn | { message: string }>
) {
  const privateKey = getRandomSecretKey();
  // @todo: use sig to replace the `owner`
  const { content, title, owner, captchaValue } = req.body;

  // check the captchaValue
  const captchaVerifyResult = await verifyRecaptcha(captchaValue);
  console.info("captchaVerifyResult", captchaVerifyResult);
  if (!captchaVerifyResult.success)
    return res.status(400).json({ message: "You failed the captcha" });

  const checksumedAuthorWallet = utils.getAddress(owner);
  const encrypted = encrypt(
    JSON.stringify({
      content,
      timestamp: Date.now(),
      title,
      version: "20210604",
    } as Snippet),
    privateKey
  );
  encrypted.owner = checksumedAuthorWallet;
  const hash = await uploadToPublic(JSON.stringify(encrypted));
  await WorkerKV.setSecretKey(hash, privateKey);
  return res.status(201).json({ encrypted, hash, privateKey });
}

export default upload;
