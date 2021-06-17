import { utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { WorkerKV } from "../../constant/kvclient";
import { encrypt, getRandomSecretKey } from "../../encryption";
import { getRequirementSigner } from "../../signatures/requirement";
import { Snippet, UploadReturn } from "../../typing";
import { uploadToPublic } from "../../utils/ipfs";
import { verifyRecaptcha } from "../../utils/verifyRecaptcha";

async function upload(
  req: NextApiRequest,
  res: NextApiResponse<UploadReturn | { message: string }>
) {
  const privateKey = getRandomSecretKey();
  const { content, title, captchaValue, requirement, deadline } = req.body;
  const { networkId, token, amount, sig } = requirement;
  const owner = getRequirementSigner(
    Number(networkId),
    token,
    amount,
    deadline,
    sig
  );
  // check the captchaValue
  const captchaVerifyResult = await verifyRecaptcha(captchaValue);
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
  await WorkerKV.setOwner(hash, owner);
  await WorkerKV.setRequirement(hash, {
    version: "20210609",
    type: "hodl",
    networkId,
    token,
    amount,
  });
  return res.status(201).json({ encrypted, hash, privateKey });
}

export default upload;
