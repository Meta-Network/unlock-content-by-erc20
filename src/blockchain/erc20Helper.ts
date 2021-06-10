import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import { ChainId } from "../constant";
import { MULTICALL_NETWORKS } from "../constant/contracts";
import { providers } from "../constant/providers";
import { BaseErc20 } from "./contracts/BaseErc20";
import { Multicall__factory } from "./contracts/MulticallFactory";

export type ERC20Profile = {
  tokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: BigNumber;
  updatedAtBlock: number;
};

export async function getProfileOfERC20(
  token: BaseErc20,
  chainId: ChainId,
  holder: string | null
): Promise<ERC20Profile> {
  const tokenAddress = token.address;
  console.info("getProfileOfERC20;:tokenAddress", tokenAddress);
  const frag = [
    token.interface.encodeFunctionData("name"),
    token.interface.encodeFunctionData("symbol"),
    token.interface.encodeFunctionData("decimals"),
  ];
  if (holder)
    frag.push(token.interface.encodeFunctionData("balanceOf", [holder]));
  const calls = frag.map((callData) => ({
    target: tokenAddress,
    callData,
  }));
  const mCallAddr = MULTICALL_NETWORKS[chainId];
  console.info("mCallAddr", mCallAddr);
  const { returnData, blockNumber } = await Multicall__factory.connect(
    mCallAddr,
    providers[chainId] as ethers.providers.Provider
  ).callStatic.aggregate(calls);
  const [name] = token.interface.decodeFunctionResult("name", returnData[0]);
  const [symbol] = token.interface.decodeFunctionResult(
    "symbol",
    returnData[1]
  );
  const [decimals] = token.interface.decodeFunctionResult(
    "decimals",
    returnData[2]
  );
  let balance = BigNumber.from(0);
  if (returnData[3])
    [balance] = token.interface.decodeFunctionResult(
      "balanceOf",
      returnData[3]
    );

  return {
    updatedAtBlock: blockNumber.toNumber(),
    name,
    symbol,
    decimals,
    balance,
    tokenAddress,
  };
}
