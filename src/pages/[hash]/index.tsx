import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ReactMarkdown from "react-markdown";
import { Row, Col, Text, Tooltip, Button } from "@geist-ui/react";
import { useBoolean } from "ahooks";
import axios from "axios";
import { SnipperForShowing } from "../../typing";
import styled from "styled-components";
import { useRecoilValue } from "recoil";
import { chainIdState } from "../../stateAtoms/chainId.atom";
import { axiosSWRFetcher } from "../../utils";
import useSWR from "swr";
import { useSigner } from "../../hooks/useSigner";
import { getEIP712Profile } from "../../constant/EIP712Domain";
import { useWallet } from "use-wallet";

dayjs.extend(relativeTime);

const DetailBar = styled.div`
* {
    margin: 4px;
}
`

const UnlockNotice = styled.div``

export default function Post() {
    const router = useRouter();
    const wallet = useWallet()
    const { signer, isSignerReady } = useSigner()
    const { hash } = router.query
    const [content, setContent] = useState<null | SnipperForShowing>(null)
    const [isLoadingError, { setTrue: onLoadingError }] = useBoolean(false)

    const [sig, setSig] = useState('')
    const { data: reqD, error } = useSWR(hash ? `/api/${hash}/requirement` : null, axiosSWRFetcher)

    const fetchData = useCallback(async () => {
        if (!isSignerReady(signer)) return;
        try {
            const sig = await signer._signTypedData(getEIP712Profile(reqD.requirement.networkId),
                {
                    RequestUnlock: [
                        { name: "token", type: "address" },
                        { name: "hash", type: "string" },
                    ],
                }, 
                {
                    token: reqD.requirement.token,
                    hash
                }
            )
            const { data } = await axios.post('/api/' + hash, {
                sig, chainId: reqD.requirement.networkId, token: reqD.requirement.token
            })
            setContent(data)  
        } catch (error) {
            onLoadingError()
        }
    }, [signer, hash, reqD, sig])

    // useEffect(() => {
    //     console.info('useEffect::hash', hash)
    //     if (hash) fetchData()
    // }, [hash, fetchData])

    if (isLoadingError) return <p>Bad hash, please check the url and try again.</p>
    if (!reqD) return <p>Loading</p>
    if (!content) return <UnlockNotice>
        <Text>You will need to unlock this see this.</Text>

        {wallet.status === 'connected' ?
            <Button onClick={() => fetchData()}>Verify my HODL & Unlock</Button> :
            <Button onClick={() => wallet.connect('injected')}>Connect MetaMask</Button>
        }
    </UnlockNotice>

    return <>
        <Text h1>{content.title}</Text>
        <DetailBar>
                <Tooltip text={content.owner} placement="bottomStart" >
                    <Text style={{ color: '#aaa' }} size={12}>
                        {content.owner.slice(0, 6)}...{content.owner.slice(-4)} 
                    </Text>
                </Tooltip>
                <Tooltip text={ new Date(content.timestamp).toLocaleString() }  placement="bottom" >
                    <Text style={{ color: '#aaa' }} size={12}>
                        {dayjs().to(content.timestamp)}
                    </Text>
                </Tooltip>
                <Text span size={12}><a href={`https://ipfs.fleek.co/ipfs/${hash}`} target="_blank"> RAW on IPFS</a></Text>
        </DetailBar>
        <div className="content">
                <ReactMarkdown>
                    {content.content}
                </ReactMarkdown>
        </div>

    </>
}