import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
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

    return <div className="div">
        <h1 className="title">{content.title}</h1>
        <h4 className="subtitle">{content.owner} @ { new Date(content.timestamp).toLocaleString() }</h4>
        <p>{content.content}</p>
    </div>
}