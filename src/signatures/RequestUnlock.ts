import { recoverTypedSignature } from "eth-sig-util";
import { providers, utils } from "ethers";
import { getEIP712Profile } from "../constant/EIP712Domain";
import { Requirement } from "../typing";
import { getDeadline } from "./utils";

const DataStructure = {
  RequestUnlock: [
    { name: "chainId", type: "uint256" },
    { name: "token", type: "address" },
    { name: "hash", type: "string" },
    { name: "deadline", type: "uint256" },
  ],
};

export function getRequestUnlockSigner(
  chainId: number,
  hash: string,
  token: string,
  sig: string,
  deadline: number
) {
  const recoveredWallet = recoverTypedSignature({
    data: {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
        ],
        ...DataStructure,
      },
      primaryType: "RequestUnlock",
      domain: getEIP712Profile(chainId),
      message: {
        chainId,
        token,
        hash,
        deadline,
      },
    },
    sig,
  });
  return utils.getAddress(recoveredWallet);
}

export async function signUnlockReqeust(
  signer: providers.JsonRpcSigner,
  requirement: Requirement,
  hash: string
) {
  const deadline = getDeadline();
  const sig = await signer._signTypedData(
    getEIP712Profile(requirement.networkId),
    DataStructure,
    {
      chainId: requirement.networkId,
      token: requirement.token,
      hash,
      deadline,
    }
  );
  return { sig, deadline };
}
