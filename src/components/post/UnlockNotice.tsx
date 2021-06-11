import { Button, Text } from "@geist-ui/react"
import axios from "axios"
import React, { useCallback } from "react"
import styled from "styled-components"
import { useWallet } from "use-wallet"
import { getEIP712Profile } from "../../constant/EIP712Domain"
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
        <Text>You will need to unlock this see this.</Text>
        <ProfileCard currentRequirement={requirement} />
        <Text>Current Balance: </Text>
        {wallet.status === 'connected' ?
            <Button onClick={() => fetchData()}>Verify my HODL & Unlock</Button> :
            <Button onClick={() => wallet.connect('injected')}>Connect MetaMask</Button>
        }
    </UnlockNoticeContainer>
}