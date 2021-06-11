import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ReactMarkdown from "react-markdown";
import { Row, Col, Text, Tooltip, Button } from "@geist-ui/react";
import { useBoolean } from "ahooks";
import axios, {AxiosInstance, AxiosError} from "axios";
import { SnipperForShowing } from "../../typing";
import styled from "styled-components";
import { useRecoilValue } from "recoil";
import { chainIdState } from "../../stateAtoms/chainId.atom";
import { axiosSWRFetcher } from "../../utils";
import useSWR from "swr";
import { useSigner } from "../../hooks/useSigner";
import { getEIP712Profile } from "../../constant/EIP712Domain";
import { useWallet } from "use-wallet";
import { ProfileCard } from "../../components/requirement/ProfileCard";
import UnlockNotice from "../../components/post/UnlockNotice";

dayjs.extend(relativeTime);

const DetailBar = styled.div`
* {
    margin: 4px;
}
`

export default function Post() {
    const router = useRouter();
    const wallet = useWallet()
    const { signer, isSignerReady } = useSigner()
    const { hash } = router.query
    const [content, setContent] = useState<null | SnipperForShowing>(null)
    const [decryptError, setDErr] = useState<any>(null)

    // const [sig, setSig] = useState('')
    const { data: reqD, error: errorOnRequirement } = useSWR(hash ? `/api/${hash}/requirement` : null, axiosSWRFetcher)

    // useEffect(() => {
    //     console.info('useEffect::hash', hash)
    //     if (hash) fetchData()
    // }, [hash, fetchData])

    if (errorOnRequirement)
        return <p>Bad hash, please check the url and try again.</p>


    if (decryptError) {
        console.info('error when decrypt: ', decryptError)
        return <div>Decryption error, msg: {JSON.stringify(decryptError)} </div>
    }

    if (!reqD) return <p>Loading</p>
    if (!content) return <UnlockNotice
        hash={hash as string}
        requirement={reqD.requirement}
        onDecrypted={(val) => setContent(val)}
        onError={(err) => { setDErr(err) }}
    />

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