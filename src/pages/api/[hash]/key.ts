import { recoverTypedSignature } from "eth-sig-util";
import { utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { getEIP712Profile } from "../../../constant/EIP712Domain";
import { WorkerKV } from "../../../constant/kvclient";

function recoverFromSig(chainId: number, hash: string, sig: string) {
  const recoveredWallet = recoverTypedSignature({
    data: {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        RequestEncryptionKey: [{ name: "hash", type: "string" }],
      },
      primaryType: "RequestEncryptionKey",
      domain: getEIP712Profile(chainId),
      message: {
        hash,
      },
    },
    sig,
  });
  return utils.getAddress(recoveredWallet);
}

async function getKeyOf(
  hash: string,
  chainId: number,
  sig: string,
  res: NextApiResponse<any>
) {
  // const recovered = recoverFromSig(chainId, hash, sig)
  const key = await WorkerKV.getSecretKey(hash);
  if (!key) res.status(404).json({ message: "Key not found" });
  else res.status(200).json({ key });
}

async function setKeyOf(
  hash: string,
  key: string,
  chainId: number,
  sig: string,
  res: NextApiResponse<any>
) {
  // const recovered = recoverFromSig(chainId, hash, sig)
  await WorkerKV.setSecretKey(hash, key);
  res.status(201).json({ message: "OK" });
}

async function removeKeyOf(
  hash: string,
  chainId: number,
  sig: string,
  res: NextApiResponse<any>
) {
  // const recovered = recoverFromSig(chainId, hash, sig)
  await WorkerKV.removeSecretKey(hash);
  res.status(200).json({ message: "OK" });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query as { hash: string };
  const { sig, chainId, key } = req.body;

  switch (req.method) {
    case "POST":
      return getKeyOf(hash, Number(chainId), sig, res);
    case "PUT":
      return setKeyOf(hash, key, Number(chainId), sig, res);
    case "DELETE":
      return removeKeyOf(hash, Number(chainId), sig, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default handler;
