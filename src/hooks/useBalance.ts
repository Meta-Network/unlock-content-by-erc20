import { BigNumber, BigNumberish, Contract, utils } from "ethers";
import { MaxUint256 } from "@ethersproject/constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "use-wallet";
import { BaseErc20 } from "../blockchain/contracts/BaseErc20";
import { ZERO_ADDRESS } from "../constant";
import { useLastUpdated } from "./useLastUpdated";

export function useBalance(token: BaseErc20) {
  const { account } = useWallet();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const [decimals, setDecimals] = useState(18);
  const { lastUpdated, updated } = useLastUpdated();

  const formattedBalance = useMemo(() => {
    return utils.formatUnits(balance, decimals);
  }, [balance, decimals]);

  const fetchBalance = useCallback(async () => {
    const result = await token.balanceOf(account as string);
    const decimals = await token.decimals();
    setBalance(result);
    setDecimals(decimals);
    updated();
  }, [token, account]);
  /**
   * use Dan's example
   * https://github.com/facebook/react/issues/14326#issuecomment-441680293
   */
  useEffect(() => {
    if (token.address === ZERO_ADDRESS) return;
    if (account && token) {
      fetchBalance();
    }
    let refreshInterval = setInterval(fetchBalance, 1000 * 10);
    return () => clearInterval(refreshInterval);
  }, [account, fetchBalance, token]);

  const isEnough = (x: BigNumberish) => balance.gte(x);

  return { balance, formattedBalance, isEnough, lastUpdated };
}
