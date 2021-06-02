import React from "react"
import { UseWalletProvider } from 'use-wallet'
import { RecoilRoot } from "recoil"

const Providers: React.FC = ({ children }) => (
    <UseWalletProvider
        chainId={56}
        connectors={{
            injected: {},
            walletconnect: {
                rpcUrl: 'https://bsc-dataseed.binance.org/',
            },
        }}>
        <RecoilRoot>
            {children}
        </RecoilRoot>
    </UseWalletProvider>
)
export default Providers
