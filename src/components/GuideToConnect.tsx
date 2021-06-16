import styled from "styled-components"
import { useWallet } from 'use-wallet'
import { Button, Text } from "@geist-ui/react";
import { useRecoilState } from 'recoil';
import { chainIdState } from '../stateAtoms/chainId.atom';
import { ChainIdToName } from '../constant';
import React, { useMemo } from 'react';
const GuideToConnectContainer = styled.div``

export default function GuideToConnect() {
    const wallet = useWallet()
    const [chainId, setChainId] = useRecoilState(chainIdState)
    // const isWalletConnected = useMemo(() => wallet.status === 'connected', [wallet])

    return <GuideToConnectContainer>
        <Text h1>🤔 Please connect your wallet</Text>
            <Text h4>👮‍♀️ Because We'll need your signature to identify you in order to set hodl requirement. </Text>
            <Text>🔐 We only require your digital signature on content hash. 
                <br />
                Feel free to 
                <a href="https://eips.ethereum.org/EIPS/eip-712" target="_blank"> check out tech spec </a>
                about Ethereum digital signature that we are using now.
        </Text>
            {/* @todo: chain selection for wallet connect */}
            <p>Connected to Network: { ChainIdToName[chainId] || '❌ Not supported Network' }(ID: {chainId})</p>
            <p>Connect Wallet by: </p>
            <Button type="secondary" onClick={() => wallet.connect('injected')}>MetaMask</Button>
            {/* <button onClick={() => wallet.connect('walletconnect')}>Wallet Connect</button> */}
    </GuideToConnectContainer>
}