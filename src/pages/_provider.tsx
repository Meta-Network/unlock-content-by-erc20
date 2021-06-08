import React from "react"
import { UseWalletProvider } from 'use-wallet'
import { RecoilRoot, useRecoilState } from "recoil"
import { GeistProvider, CssBaseline } from '@geist-ui/react'
import { chainIdState } from "../stateAtoms/chainId.atom"
import Listener from "./_listener"

const UseWalletProviderWithState: React.FC = ({ children }) => {
    const [chainId] = useRecoilState(chainIdState)
    return (
        <UseWalletProvider
            chainId={chainId}
            connectors={{
                injected: {}
            }}>
            {children}
        </UseWalletProvider>
    )
}

const Providers: React.FC = ({ children }) => (
    <RecoilRoot>
        <UseWalletProviderWithState>
            <Listener />
            <GeistProvider>
                <CssBaseline />
                {children}
            </GeistProvider>
        </UseWalletProviderWithState>
    </RecoilRoot>
)
export default Providers
