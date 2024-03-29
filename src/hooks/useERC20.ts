import { BigNumber, ethers, utils } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "use-wallet";
import { BaseErc20Factory } from "../blockchain/contracts/BaseErc20Factory";
import { ERC20Profile, getProfileOfERC20 } from "../blockchain/erc20Helper";
import { ChainId, ZERO_ADDRESS } from "../constant";
import { providers } from "../constant/providers";
import { useBalance } from "./useBalance";
import { useSigner } from "./useSigner";

export function useERC20(
  tokenAddress: string | null,
  chainId?: ChainId,
  updateInterval = 60
) {
  const { account } = useWallet();
  const { signer, isSignerReady } = useSigner();

  const token = useMemo(() => {
    if (!chainId) return null;
    const readonlyProvider = providers[chainId] as ethers.providers.Provider;
    if (!tokenAddress)
      return BaseErc20Factory.connect(ZERO_ADDRESS, readonlyProvider);
    if (isSignerReady(signer)) {
      return BaseErc20Factory.connect(tokenAddress, signer);
    } else {
      return BaseErc20Factory.connect(tokenAddress, readonlyProvider);
    }
  }, [tokenAddress, chainId, signer]);

  const profileWhileLoading: ERC20Profile = {
    tokenAddress: ZERO_ADDRESS,
    name: "Loading Token Profile",
    symbol: "Please wait",
    decimals: 18, // most the token use 18 decimals
    updatedAtBlock: 0,
  };

  const [tokenProfile, setTokenProfile] = useState<ERC20Profile>(
    profileWhileLoading
  );
  const resetProfileToLoading = () => setTokenProfile(profileWhileLoading);
  const isProfileLoading = useMemo(() => tokenProfile.updatedAtBlock === 0, [
    tokenProfile,
  ]);

  const getProfile = useCallback(async () => {
    if (!token || !chainId) return;
    if (token.address === ZERO_ADDRESS) return;
    resetProfileToLoading();
    const profile = await getProfileOfERC20(token, chainId);
    console.info("profile", profile);
    setTokenProfile(profile);
  }, [token, chainId, account]);

  /**
   * use Dan's example
   * https://github.com/facebook/react/issues/14326#issuecomment-441680293
   */
  useEffect(() => {
    if (!token || !chainId) return;
    if (token.address === ZERO_ADDRESS) return;
    getProfile();
    // let refreshInterval = setInterval(getProfile, 1000 * updateInterval);
    // return () => clearInterval(refreshInterval);
  }, [getProfile, token, updateInterval]);

  return { token, chainId, isProfileLoading, tokenProfile };
}
