import React from "react"
import { UseWalletProvider } from 'use-wallet'
import { RecoilRoot, useRecoilState } from "recoil"
import { GeistProvider, CssBaseline } from '@geist-ui/react'
import { chainIdState } from "../stateAtoms/chainId.atom"
import { useEffect } from "react"
import dynamic from "next/dynamic"
const Listener = dynamic(() => import("./_listener"), { ssr: false })

const UseWalletProviderWithState: React.FC = ({ children }) => {
    const [chainId] = useRecoilState(chainIdState)
    useEffect(() => {
        // for the recaptcha component
        if (process.browser) {
            (window as any).recaptchaOptions = {
                useRecaptchaNet: true,
            };
        }
    }, [])
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
