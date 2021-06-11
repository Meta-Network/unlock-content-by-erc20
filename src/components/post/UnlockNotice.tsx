import { Button, Text, Tooltip } from "@geist-ui/react"
import axios from "axios"
import { ethers, utils } from "ethers"
import React, { useCallback, useMemo } from "react"
import { useRecoilValue } from "recoil"
import styled from "styled-components"
import { useWallet } from "use-wallet"
import { BaseErc20Factory } from "../../blockchain/contracts/BaseErc20Factory"
import { ChainId, ChainIdToName } from "../../constant"
import { getEIP712Profile } from "../../constant/EIP712Domain"
import { providers } from "../../constant/providers"
import QuestionCircle from '@geist-ui/react-icons/questionCircle'
import { useBalance } from "../../hooks/useBalance"
import { useSigner } from "../../hooks/useSigner"
import { chainIdState } from "../../stateAtoms/chainId.atom"
import { Requirement, SnipperForShowing } from "../../typing"
import { ProfileCard } from "../requirement/ProfileCard"
import useSWR from "swr"
import { axiosSWRFetcher } from "../../utils"

type UnlockNoticeParams = {
    onDecrypted: (data: SnipperForShowing) => any;
    onError: (err: any) => any;
    hash: string;
    requirement: Requirement;
}

const UnlockNoticeContainer = styled.div``


export default function UnlockNotice({ onDecrypted, onError, requirement, hash }: UnlockNoticeParams) {
    const wallet = useWallet()
    const { data: ipfsData } = useSWR(hash ? `https://ipfs.fleek.co/ipfs/${hash}` : null, axiosSWRFetcher)
    const currentConnectedChain = useRecoilValue(chainIdState)
    const token = useMemo(() => {
        const provider = providers[requirement.networkId as ChainId]
        return BaseErc20Factory.connect(requirement.token, provider as ethers.providers.Provider)
    }, [requirement])
    const { formattedBalance, lastUpdated, isEnough } = useBalance(token)
    const { signer, isSignerReady } = useSigner()

    const fetchData = useCallback(async () => {
        if (!isSignerReady(signer)) return;
        try {
            const sig = await signer._signTypedData(getEIP712Profile(requirement.networkId),
                {
                    RequestUnlock: [
                        { name: "token", type: "address" },
                        { name: "hash", type: "string" },
                    ],
                }, 
                {
                    token: requirement.token,
                    hash
                }
            )
            const { data } = await axios.post('/api/' + hash, {
                sig, chainId: requirement.networkId, token: requirement.token
            })
            onDecrypted(data)  
        } catch (error) {
            if (axios.isAxiosError(error)) {
                onError(error.response?.data)
            } else {
                onError(error)
            }
        }
    }, [signer, hash, requirement])

    const isGoodToUnlock = useMemo(() => {
        if (isEnough(requirement.amount)) return true;
        if (ipfsData && wallet.account && ipfsData.owner === wallet.account) return true;
        return false;
    }, [requirement, isEnough, wallet, ipfsData])
    
    return <UnlockNoticeContainer>
        <Text>You will need to request a unlock to see this.</Text>
        <ProfileCard currentRequirement={requirement} />
        
        <Text>
            Connected Network: {ChainIdToName[currentConnectedChain] || '❌ Unknown'}
        </Text>

        {wallet.status === 'connected' ?
            <>
                <Text>👛 {wallet.account}</Text>
                <Text>Current Balance: {formattedBalance}</Text>
                { lastUpdated.getTime() !== 0 && <Text> { isGoodToUnlock ? '✅ Is' : '❌ Not' } Qualified to request unlock </Text>}
                <Button onClick={() => fetchData()}>Verify my HODL & Unlock</Button>
            </>
            :
            currentConnectedChain === requirement.networkId
                ? <Button onClick={() => wallet.connect('injected')}>Connect with MetaMask</Button>
                : `Please switch to ${ChainIdToName[requirement.networkId as ChainId] || requirement.networkId} Network to continue.`
        }
    </UnlockNoticeContainer>
}