import { NextApiRequest, NextApiResponse } from "next";
import { BigNumber } from "@ethersproject/bignumber";
import { utils } from "ethers";
import { WorkerKV } from "../../../constant/kvclient";
import { ZERO_ADDRESS } from "../../../constant";
import { getRequirementSigner } from "../../../signatures/requirement";

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
  const { networkId, token, amount, sig, deadline } = body;
  if (BigNumber.from(amount).eq(0)) {
    return res.status(400).json({ message: "Use DELETE instead" });
  }
  const signer = getRequirementSigner(networkId, token, amount, deadline, sig);
  const owner = await WorkerKV.getOwner(hash);
  console.info("owner:", owner);
  console.info("signer:", signer);
  if (utils.getAddress(owner) !== signer) {
    return res.status(400).json({ message: "Need to be owner to do this" });
  }
  const success = await WorkerKV.setRequirement(hash, body);
  if (success) res.status(201).json({ message: "ok" });
  else res.status(400).json({ message: "Unknown error" });
}
async function removeRequirement(
  hash: string,
  body: any,
  res: NextApiResponse<any>
) {
  const { networkId, sig, deadline } = body;
  const signer = getRequirementSigner(
    networkId,
    ZERO_ADDRESS,
    "0",
    deadline,
    sig
  );
  const owner = await WorkerKV.getOwner(hash);
  console.info("owner:", owner);
  console.info("signer:", signer);
  if (utils.getAddress(owner) !== signer) {
    return res.status(400).json({ message: "Need to be owner to do this" });
  }
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
