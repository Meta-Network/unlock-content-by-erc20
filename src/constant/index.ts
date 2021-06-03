export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  BSC_MAINNET = 56,
  BSC_TESTNET = 97,
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const currentChainId = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID || 56
) as ChainId;

const MegaByte = 1024 * 1024;
export const MAX_FILE_SIZE = 10 * MegaByte;

export const MINUTE = 1000 * 60;
