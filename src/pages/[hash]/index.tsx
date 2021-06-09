import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Row, Col, Text, Container } from "@geist-ui/react";
import { useBoolean } from "ahooks";
import axios from "axios";
import { SnipperForShowing } from "../../typing";

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
        <Row>
            <Col>
                <Text style={{ color: '#aaa' }}>
                    {content.owner} at {new Date(content.timestamp).toLocaleString()}
                </Text>
            </Col>
            <Col>
                <Text><a href={`https://ipfs.fleek.co/ipfs/${hash}`} target="_blank"> RAW on IPFS</a></Text>
            </Col>
        </Row>
        <div className="content">
                <ReactMarkdown>
                    {content.content}
                </ReactMarkdown>
        </div>

    </>
}