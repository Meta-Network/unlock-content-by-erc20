import { NextApiRequest, NextApiResponse } from "next";
import { recoverTypedSignature } from "eth-sig-util";
import { BigNumber } from "@ethersproject/bignumber";
import { utils } from "ethers";
import { getEIP712Profile } from "../../../constant/EIP712Domain";
import { WorkerKV } from "../../../constant/kvclient";

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

async function getRequirement(hash: string, res: NextApiResponse) {
  try {
    const data = await WorkerKV.getRequirement(hash);
    if (data) res.status(200).json({ requirement: data });
    else res.status(404).json({ message: "Not found" });
  } catch (error) {
    res.status(404).json({ message: "Not found" });
  }
}
async function setRequirement(
  hash: string,
  body: any,
  res: NextApiResponse<any>
) {
  const { chainId, token, amount, sig } = body;
  if (BigNumber.from(amount).eq(0)) {
    return res.status(400).json({ message: "Use DELETE instead" });
  }
  const signer = recoverFromSig(Number(chainId), token, amount, sig);
  // @todo: check permission with `signer` etc.

  const success = await WorkerKV.setRequirement(hash, body);
  if (success) res.status(201).json({ message: "ok" });
  else res.status(400).json({ message: "Unknown error" });
}
async function removeRequirement(
  hash: string,
  body: any,
  res: NextApiResponse<any>
) {
  const { chainId, token, amount, sig } = body;
  if (BigNumber.from(amount).gt(0)) {
    return res.status(400).json({ message: "Use PUT instead" });
  }
  const signer = recoverFromSig(Number(chainId), token, amount, sig);
  // @todo: check permission with `signer` etc.

  const success = await WorkerKV.removeRequirement(hash);
  if (success) res.status(201).json({ message: "ok" });
  else res.status(400).json({ message: "Unknown error" });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query as { hash: string };

  switch (req.method) {
    case "GET":
      return getRequirement(hash, res);
    case "PUT":
      return setRequirement(hash, req.body, res);
    case "DELETE":
      return removeRequirement(hash, req.body, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default handler;
