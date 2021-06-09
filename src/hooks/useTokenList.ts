import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useWallet } from "use-wallet";
import { StandardTokenList } from "../typing";
import { axiosSWRFetcher } from "../utils";

export function useTokenList(selectedChainId: number) {
  const wallet = useWallet();
  const tokenListURI = useMemo(() => {
    switch (selectedChainId) {
      case 1:
        return "https://tokens.coingecko.com/uniswap/all.json";
      case 56:
        return "https://tokens.pancakeswap.finance/pancakeswap-top-100.json";
      default:
        return null;
    }
  }, [selectedChainId]);

  const { data, error } = useSWR(tokenListURI, axiosSWRFetcher);
  const [tokenBalanceMap, setTokenBalanceMap] = useState({});
  const tokenList = useMemo(() => data as StandardTokenList, [data]);
  //   const fetchBalances = useCallback(() => {});
  useEffect(() => {}, [JSON.stringify(tokenList.tokens)]);

  return { tokenList };
}
