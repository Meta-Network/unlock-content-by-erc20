import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ReactMarkdown from "react-markdown";
import { Row, Col, Text, Tooltip } from "@geist-ui/react";
import { useBoolean } from "ahooks";
import axios from "axios";
import { SnipperForShowing } from "../../typing";
import styled from "styled-components";

dayjs.extend(relativeTime);

const DetailBar = styled.div`
* {
    margin: 4px;
}
`

export default function Post() {
    const router = useRouter();
    const { hash } = router.query
    const [content, setContent] = useState<null | SnipperForShowing>(null)
    const [isLoadingError, { setTrue: onLoadingError }] = useBoolean(false)

    const fetchData = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/' + hash)
            setContent(data)  
        } catch (error) {
            onLoadingError()
        }
    }, [hash])

    useEffect(() => {
        console.info('useEffect::hash', hash)
        if (hash) fetchData()
    }, [hash, fetchData])

    if (isLoadingError) return <p>Bad hash, please check the url and try again.</p>
    if (!content) return <p>Loading</p>

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