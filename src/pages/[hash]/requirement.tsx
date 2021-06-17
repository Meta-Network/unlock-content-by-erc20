import React, { useCallback, useMemo, useState } from "react";
import { Button, Input, Radio, Text, Description, Card, Tooltip, Note, User } from "@geist-ui/react";
import styled from "styled-components"
import useSWR, { mutate } from "swr";
import { BigNumber } from "@ethersproject/bignumber";
import axios from "axios";
import { axiosSWRFetcher } from "../../utils";
import TokenSelector from "../../components/TokenSelector";
import { Requirement, StandardTokenProfile } from "../../typing";
import { utils } from "ethers";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";
import { chainIdState } from "../../stateAtoms/chainId.atom";
import { ChainIdToName, ZERO_ADDRESS } from "../../constant";
import { ProfileCard } from "../../components/requirement/ProfileCard";
import { useSigner } from "../../hooks/useSigner";
import { getEIP712Profile } from "../../constant/EIP712Domain";
import { useWallet } from "use-wallet";
import dynamic from "next/dynamic";
import { signRequirement } from "../../signatures/requirement";

const GuideToConnect = dynamic(() => import('../../components/GuideToConnect'), { ssr: false });

const SetRequirementContainer = styled.div``
const BtnActions = styled.div``

export default function SetRequirementPage() {
    const router = useRouter()
    const wallet = useWallet()
    const { signer, isSignerReady } = useSigner()
    const { hash } = router.query
    const targetChainId = useRecoilValue(chainIdState)
    const { data: currentRequirement, error } = useSWR(hash ? `/api/${hash}/requirement` : null, axiosSWRFetcher)
    const [targetToken, setToken] = useState<StandardTokenProfile | null>(null)

    const [minimumAmountToHodl, setMinimumAmountToHodl] = useState<BigNumber>(BigNumber.from(0))

    const handleAmountInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!targetToken) return
        try {
            const parsedAmount = utils.parseUnits(e.target.value, targetToken.decimals)
            setMinimumAmountToHodl(parsedAmount)
        } catch (error) {
            alert('Bad Element deteced, please check your number input.')
        }
    },[ targetToken ])
    
    const SetRequirement = useCallback(async () => {
        if (typeof hash !== 'string') return;
        if (!targetToken) {
            alert('No token was selected, canceled.')
            return;
        }
        if (!isSignerReady(signer)) return;

        const {sig, deadline} = await signRequirement(signer, targetToken, minimumAmountToHodl);


        await axios.put(`/api/${hash}/requirement`, {
            version: '20210609',
            type: 'hodl',
            networkId: targetToken.chainId,
            token: targetToken.address,
            amount: minimumAmountToHodl.toString(),
            sig,
            deadline
        })
        alert('Requirement is set, the update will be good in 2 min.')
    }, [hash, targetToken, targetChainId, minimumAmountToHodl, signer])

    if (wallet.status !== 'connected') {
        return <div>
                <GuideToConnect />
            </div>
    }

    return <SetRequirementContainer>
        <Text h1>Set requirement to Unlock the snippet</Text>
        {currentRequirement && !error && <ProfileCard currentRequirement={currentRequirement.requirement} />}

        <Description title="Token On which Network?" content={
            <>
                <Text h4>{ChainIdToName[targetChainId]}</Text>
                <Note type="secondary" label="Switch network? ">
                    Switch your network in your metamask. We Supported ETH Mainnet, BSC Mainnet, and some testnets.
                </Note>
            </>
        } />

        
        <Description title="Which Token hodl to unlock?" content={
            <div>
                { targetToken && <User name={targetToken.symbol} src={targetToken.logoURI} /> }
                    <TokenSelector
                        onSelected={setToken}>
                        { targetToken ? 'Change' : 'Select' }
                        </TokenSelector>
            </div>
        } />
        { targetToken && <Description title="The Minimum hodl requirement:" content={
            <Input placeholder="e.g 114514.1919" width="50%"
                onChange={handleAmountInput}
            />
        } />}
        <BtnActions>
            <Button type="secondary" onClick={SetRequirement}>Sign & Set</Button>
        </BtnActions>
    </SetRequirementContainer>
}