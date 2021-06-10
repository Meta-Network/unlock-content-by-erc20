import { ZERO_ADDRESS } from ".";

export const getEIP712Profile = (chainId: number) => ({
  name: "Hodl To Unlock",
  version: "1",
  chainId,
  // verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  verifyingContract: ZERO_ADDRESS,
});
