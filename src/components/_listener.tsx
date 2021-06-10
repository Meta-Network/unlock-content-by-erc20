import { useEffect } from "react"
import { useRecoilState } from "recoil"
import { ChainId } from "../constant"
import { chainIdState } from "../stateAtoms/chainId.atom"


export default function Listener() {
    const [_, setChainId] = useRecoilState(chainIdState)

    useEffect(() => {
        if (!process.browser) return

        // if (window as any).ethereum injected
        if ((window as any).ethereum) {
            // setup the connect chainId if metamask was detected
            const initialChainId = (window as any).ethereum.chainId;
            setChainId(Number(initialChainId));
                
            (window as any).ethereum.on('chainChanged', (newChainId: string) => {
                setChainId(Number(newChainId) as ChainId)
            })
        }
    }, [process, setChainId])
    return <></>
}