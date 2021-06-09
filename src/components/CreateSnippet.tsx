import React, { useCallback, useMemo, useRef } from "react";
import axios from "axios";
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { UploadReturn } from "../typing";
import { useWallet } from "use-wallet";
import { Button } from "@geist-ui/react";
import { useBoolean } from "ahooks";

type CreateSnippetParams = {
    // callback
    onSent: (obj: UploadReturn) => void
}

export default function CreateSnippet({ onSent }: CreateSnippetParams) {
    const wallet = useWallet()
    const [ isSending, { setFalse: enableSendBtn, setTrue: disableSendBtn } ] = useBoolean(false)
    const editorRef = useRef<Editor>() as React.MutableRefObject<Editor>

    const send = useCallback(async () => {
        disableSendBtn()
        const contentInput = editorRef.current?.getInstance().getMarkdown()
        const { data } = await axios.post<UploadReturn>('/api/upload', {
            content: contentInput,
            owner: wallet.account
        })
        onSent(data)
        enableSendBtn()
    }, [editorRef])

    return <>
        <Editor
        initialValue=""
        previewStyle="vertical"
        height="600px"
        initialEditType="markdown"
        useCommandShortcut={true}
        ref={editorRef}
        />
        <div className="exported-md">
            <Button onClick={() => send()} loading={isSending} disabled={isSending}>Send</Button>
        </div>
    </>
}