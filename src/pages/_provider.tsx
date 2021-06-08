import React from "react"
import { UseWalletProvider } from 'use-wallet'
import { RecoilRoot, useRecoilState } from "recoil"
import { chainIdState } from "../stateAtoms/chainId.atom"

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
            {children}
        </UseWalletProviderWithState>
    </RecoilRoot>
)
export default Providers
