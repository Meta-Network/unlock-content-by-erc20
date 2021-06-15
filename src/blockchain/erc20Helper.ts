import { BigNumber } from "@ethersproject/bignumber";
import { ethers, utils } from "ethers";
import { ChainId } from "../constant";
import { MULTICALL_NETWORKS } from "../constant/contracts";
import { providers } from "../constant/providers";
import { BaseErc20 } from "./contracts/BaseErc20";
import { Multicall__factory } from "./contracts/MulticallFactory";
import { ERC20_v0 } from "./contracts/StupidERC20";

export type ERC20Profile = {
  tokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  updatedAtBlock: number;
};

export async function getProfileOfERC20(
  token: BaseErc20,
  chainId: ChainId
): Promise<ERC20Profile> {
  const tokenAddress = token.address;
  console.info("getProfileOfERC20::tokenAddress", tokenAddress);
  const frag = [
    token.interface.encodeFunctionData("name"),
    token.interface.encodeFunctionData("symbol"),
    token.interface.encodeFunctionData("decimals"),
  ];
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
  try {
    const [name] = token.interface.decodeFunctionResult("name", returnData[0]);
    const [symbol] = token.interface.decodeFunctionResult(
      "symbol",
      returnData[1]
    );
    const [decimals] = token.interface.decodeFunctionResult(
      "decimals",
      returnData[2]
    );

    return {
      updatedAtBlock: blockNumber.toNumber(),
      name,
      symbol,
      decimals,
      tokenAddress,
    };
  } catch (error) {
    console.error("getProfileOfERC20::error", error);
    return getProfileOfERC20Compatiable(token, chainId);
  }
}

/**
 * only for those who bytes32
 */
export async function getProfileOfERC20Compatiable(
  _token: BaseErc20,
  chainId: ChainId
): Promise<ERC20Profile> {
  const tokenAddress = _token.address;
  const token = ERC20_v0.attach(_token.address).connect(_token.provider);
  console.info("getProfileOfERC20::Compatiable::tokenAddress", tokenAddress);
  const [blockNumber, name, symbol, decimals] = await Promise.all([
    (providers[chainId] as ethers.providers.Provider).getBlockNumber(),
    token.name(),
    token.symbol(),
    token.decimals(),
  ]);
  let balance = BigNumber.from(0);
  return {
    updatedAtBlock: blockNumber,
    name: utils.parseBytes32String(name),
    symbol: utils.parseBytes32String(symbol),
    decimals,
    tokenAddress,
  };
}
