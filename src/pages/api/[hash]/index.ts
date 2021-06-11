import { recoverTypedSignature } from "eth-sig-util";
import { BigNumber, ethers, utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { BaseErc20Factory } from "../../../blockchain/contracts/BaseErc20Factory";
import { ChainId } from "../../../constant";
import { getEIP712Profile } from "../../../constant/EIP712Domain";
import { WorkerKV } from "../../../constant/kvclient";
import { providers } from "../../../constant/providers";
import { decrypt } from "../../../encryption";
import {
  EncryptedSnippet,
  Requirement,
  Snippet,
  UnlockedSnippet,
} from "../../../typing";
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
          { name: "token", type: "address" },
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

async function getBalance(
  chainId: number,
  token: string,
  who: string
): Promise<BigNumber> {
  const provider = providers[chainId as ChainId];
  if (!provider) throw new Error(`Unsupported Chain ${chainId}`);

  const tokenObj = BaseErc20Factory.connect(token, provider);
  return tokenObj.balanceOf(who);
}

async function getPreviewOf(hash: string, res: NextApiResponse<any>) {
  return getUnlockedContent(hash, "", 0, "", res);
}

async function permissionCheck(
  requirement: Requirement | null,
  encryptedData: EncryptedSnippet,
  chainId: number,
  who: string,
  token: string
): Promise<void> {
  // If `requirement` exist, skip these check
  if (!requirement) return;
  // If `requirement` exist, but not matching requirement, throw error
  if (
    requirement.networkId !== chainId ||
    utils.getAddress(requirement.token) !== utils.getAddress(token)
  ) {
    throw new Error("Bad parameter to unlock");
  }

  // If `requirement` exist, verify.
  // Otherwise, just skip and unlock then.
  const currentBalance: BigNumber = await getBalance(
    requirement?.networkId,
    token,
    who
  );
  /** throw a error when:
   * - currentBalance < requirement.amount
   * - and -
   * - the signer is not the owner */
  if (who !== encryptedData.owner && currentBalance.lt(requirement.amount)) {
    throw new Error(
      "Balance is not enough for unlock, please try again later."
    );
  }
}

async function getUnlockedContent(
  hash: string,
  token: string,
  chainId: number,
  sig: string,
  res: NextApiResponse<UnlockedSnippet | { message: string }>
) {
  const encryptedData = await ipfsCat<EncryptedSnippet>(hash);
  const requirement = await WorkerKV.getRequirement(hash);

  const who = recoverFromSig(chainId, hash, token, sig);
  // do some check here
  await permissionCheck(requirement, encryptedData, chainId, who, token);

  // check finish, decrypt now

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
