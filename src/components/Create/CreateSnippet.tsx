import React, { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { UploadReturn } from "../../typing";
import { useWallet } from "use-wallet";
import { Button, Input } from "@geist-ui/react";
import { useBoolean } from "ahooks";
import ReCAPTCHA from "react-google-recaptcha";
import styled from "styled-components";

type CreateSnippetParams = {
    // callback
    onSent: (obj: UploadReturn) => void
}

const CreateSnippetContainer = styled.div`
max-width: 100%;
`

const MarginedContainer = styled.div`
margin: 1rem 0;
`

export default function CreateSnippet({ onSent }: CreateSnippetParams) {
    const wallet = useWallet()
    const [title, setTitle] = useState('')
    const [captchaValue, setCatpchaVal] = useState<string | null>(null)
    const [ isSending, { setFalse: enableSendBtn, setTrue: disableSendBtn } ] = useBoolean(false)
    const editorRef = useRef<Editor>() as React.MutableRefObject<Editor>

    const send = useCallback(async () => {
        disableSendBtn()
        const contentInput = editorRef.current?.getInstance().getMarkdown()
        try {
            const { data } = await axios.post<UploadReturn>('/api/upload', {
                title,
                content: contentInput,
                owner: wallet.account,
                captchaValue
            })
            onSent(data)
        } catch (error) {
            alert('Error happened: ' + error)
        } finally {
            enableSendBtn()
        }
    }, [title, onSent, editorRef, captchaValue])

    return <CreateSnippetContainer>
        <Input placeholder='Title for snippet (Optional)' width='100%' onChange={e => setTitle(e.target.value)} />
        <Editor
            initialValue={`## Sub Title (If you needed)
Content`}
        previewStyle="vertical"
        height="600px"
        initialEditType="markdown"
        useCommandShortcut={true}
        ref={editorRef}
        />
        <MarginedContainer>
            <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY || ''}
                onChange={setCatpchaVal}
            />
        </MarginedContainer>
        <div className="exported-md" style={{ margin: "4px" }}>
            <Button type="secondary" onClick={() => send()} loading={isSending}
                disabled={isSending || !captchaValue}
            >Post this snippet</Button>
        </div>
    </CreateSnippetContainer>
}