import { recoverTypedSignature } from "eth-sig-util";
import { BigNumberish, providers, utils } from "ethers";
import { getEIP712Profile } from "../constant/EIP712Domain";
import { StandardTokenProfile } from "../typing";
import { checkDeadline, getDeadline } from "./utils";

const DataStructure = {
  Requirement: [
    { name: "chainId", type: "uint256" },
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

export async function signRequirement(
  signer: providers.JsonRpcSigner,
  targetToken: StandardTokenProfile,
  amount: BigNumberish
) {
  const deadline = getDeadline();
  const sig = await signer._signTypedData(
    getEIP712Profile(targetToken.chainId),
    DataStructure,
    {
      chainId: targetToken.chainId,
      token: targetToken.address,
      amount,
      deadline,
    }
  );
  return { sig, deadline };
}

export function getRequirementSigner(
  chainId: number,
  token: string,
  amount: string,
  deadline: number,
  sig: string
) {
  checkDeadline(deadline);
  const recoveredWallet = recoverTypedSignature({
    data: {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
        ],
        ...DataStructure,
      },
      primaryType: "Requirement",
      domain: getEIP712Profile(chainId),
      message: {
        chainId,
        token,
        amount,
        deadline,
      },
    },
    sig,
  });
  return utils.getAddress(recoveredWallet);
}
