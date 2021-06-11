import { Button, Text } from "@geist-ui/react"
import axios from "axios"
import { ethers, utils } from "ethers"
import React, { useCallback, useMemo } from "react"
import styled from "styled-components"
import { useWallet } from "use-wallet"
import { BaseErc20Factory } from "../../blockchain/contracts/BaseErc20Factory"
import { ChainId } from "../../constant"
import { getEIP712Profile } from "../../constant/EIP712Domain"
import { providers } from "../../constant/providers"
import { useBalance } from "../../hooks/useBalance"
import { useSigner } from "../../hooks/useSigner"
import { Requirement, SnipperForShowing } from "../../typing"
import { ProfileCard } from "../requirement/ProfileCard"

type UnlockNoticeParams = {
    onDecrypted: (data: SnipperForShowing) => any;
    onError: (err: any) => any;
    hash: string;
    requirement: Requirement;
}

const UnlockNoticeContainer = styled.div``


export default function UnlockNotice({ onDecrypted, onError, requirement, hash }: UnlockNoticeParams) {
    const wallet = useWallet()
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
    
    return <UnlockNoticeContainer>
        <Text>You will need to request a unlock to see this.</Text>
        <ProfileCard currentRequirement={requirement} />
        {wallet.status === 'connected' ?
            <>
                <Text>👛 { wallet.account }</Text>
                <Text>Current Balance: {formattedBalance}</Text>
                { lastUpdated.getTime() !== 0 && <Text> { isEnough(requirement.amount) ? '✅ Is' : '❌ Not' } Qualified to request unlock </Text>}
                <Button onClick={() => fetchData()}>Verify my HODL & Unlock</Button>
            </>
            : <Button onClick={() => wallet.connect('injected')}>Connect with MetaMask</Button>
        }
    </UnlockNoticeContainer>
}