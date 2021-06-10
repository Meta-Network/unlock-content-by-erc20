import { BigNumberish, ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { WETH9__factory } from "../blockchain/contracts/WETH9__factory";
import { useSigner } from "./useSigner";

export function useWETH(
  currentProvider: ethers.providers.Provider,
  address: string
) {
  const { signer, isSignerReady } = useSigner();
  const weth = useMemo(() => {
    const readonlyProvider = currentProvider;
    if (isSignerReady(signer)) {
      return WETH9__factory.connect(address, signer);
    } else {
      return WETH9__factory.connect(address, readonlyProvider);
    }
  }, [signer]);

  const deposit = useCallback(
    async (amount: BigNumberish) => {
      if (!isSignerReady(signer))
        throw new Error("Please connect wallet to continue");

      const txRequest = await weth.deposit({ value: amount });
      const receipt = await txRequest.wait();
      return { txRequest, receipt };
    },
    [signer, weth]
  );

  const withdraw = useCallback(
    async (amount: BigNumberish) => {
      if (!isSignerReady(signer))
        throw new Error("Please connect wallet to continue");

      const txRequest = await weth.withdraw(amount);
      const receipt = await txRequest.wait();
      return { txRequest, receipt };
    },
    [signer, weth]
  );

  return { weth, deposit, withdraw };
}
