import { recoverTypedSignature } from "eth-sig-util";
import { utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { getEIP712Profile } from "../../../constant/EIP712Domain";
import { WorkerKV } from "../../../constant/kvclient";
import { decrypt } from "../../../encryption";
import { EncryptedSnippet, Snippet, UnlockedSnippet } from "../../../typing";
import { ipfsCat } from "../../../utils/ipfs";

function recoverFromSig(
  chainId: number,
  hash: string,
  token: string,
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
        RequestUnlock: [
          { name: "token", type: "string" },
          { name: "hash", type: "string" },
        ],
      },
      primaryType: "RequestUnlock",
      domain: getEIP712Profile(chainId),
      message: {
        token,
        hash,
      },
    },
    sig,
  });
  return utils.getAddress(recoveredWallet);
}

async function getPreviewOf(hash: string, res: NextApiResponse<any>) {
  return getUnlockedContent(hash, "", 0, "", res);
}

async function getUnlockedContent(
  hash: string,
  token: string,
  chainId: number,
  sig: string,
  res: NextApiResponse<UnlockedSnippet | { message: string }>
) {
  // const recovered = recoverFromSig(chainId, hash, sig)
  const encryptedData = await ipfsCat<EncryptedSnippet>(hash);
  if (!encryptedData.content || !encryptedData.iv) {
    return res.status(400).json({ message: "Bad file for us" });
  }
  // trying to find the encryption key
  const key = await WorkerKV.getSecretKey(hash);
  if (!key)
    return res.status(400).json({ message: "Encryption Key was removed" });

  // Decrypt with the key
  const result = decrypt(encryptedData, key);
  // trying to parse to Snippet
  const decryptedSnippet = JSON.parse(result) as Snippet;

  // produce the result
  return res.status(200).json({
    ...decryptedSnippet,
    owner: encryptedData.owner,
  });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query as { hash: string };
  const { sig, chainId, token } = req.body;

  switch (req.method) {
    case "GET":
      return getPreviewOf(hash, res);
    case "POST":
      return getUnlockedContent(hash, token, Number(chainId), sig, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default handler;
