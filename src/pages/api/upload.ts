import { recoverTypedSignature } from "eth-sig-util";
import { utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { getEIP712Profile } from "../../constant/EIP712Domain";
import { WorkerKV } from "../../constant/kvclient";
import { encrypt, getRandomSecretKey } from "../../encryption";
import { EncryptedSnippet, Snippet, UploadReturn } from "../../typing";
import { uploadToPublic } from "../../utils/ipfs";
import { verifyRecaptcha } from "../../utils/verifyRecaptcha";

function recoverFromSig(
  chainId: number,
  token: string,
  amount: string,
  sig: string
) {
  const recoveredWallet = recoverTypedSignature({
    data: {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Requirement: [
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
        ],
      },
      primaryType: "Requirement",
      domain: getEIP712Profile(chainId),
      message: {
        token,
        amount,
      },
    },
    sig,
  });
  return utils.getAddress(recoveredWallet);
}

async function upload(
  req: NextApiRequest,
  res: NextApiResponse<UploadReturn | { message: string }>
) {
  const privateKey = getRandomSecretKey();
  const { content, title, captchaValue, requirement } = req.body;
  const { networkId, token, amount, sig } = requirement;
  const owner = recoverFromSig(Number(networkId), token, amount, sig);
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
