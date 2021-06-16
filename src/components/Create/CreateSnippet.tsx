import React, { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { StandardTokenProfile, UploadReturn } from "../../typing";
import { useWallet } from "use-wallet";
import { Button, Description, Grid, Input, User } from "@geist-ui/react";
import { useBoolean } from "ahooks";
import ReCAPTCHA from "react-google-recaptcha";
import styled from "styled-components";
import TokenSelector from "../TokenSelector";
import { BigNumber, utils } from "ethers";
import { useSigner } from "../../hooks/useSigner";
import { getEIP712Profile } from "../../constant/EIP712Domain";

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
    const { signer, isSignerReady } = useSigner()
    const [title, setTitle] = useState('')
    const [targetToken, setToken] = useState<StandardTokenProfile | null>(null)
    const [minimumAmountToHodl, setMinimumAmountToHodl] = useState<string>('0')

    const handleAmountInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            try {
                utils.parseUnits(e.target.value, targetToken?.decimals || 18)
                setMinimumAmountToHodl(e.target.value)
            } catch (error) {
                alert('Bad Element deteced, please check your number input.')
            }
    }, [targetToken, targetToken?.decimals])
    
    const parsedAmount = useMemo(() => {
        return utils.parseUnits(minimumAmountToHodl, targetToken?.decimals || 18)
    }, [minimumAmountToHodl, targetToken])

    const [captchaValue, setCatpchaVal] = useState<string | null>(null)
    const [ isSending, { setFalse: enableSendBtn, setTrue: disableSendBtn } ] = useBoolean(false)
    const editorRef = useRef<Editor>() as React.MutableRefObject<Editor>

    const isNotEnoughToSend = useMemo(() => {
        return isSending || captchaValue === null || parsedAmount.eq(0)
    }, [isSending, captchaValue, parsedAmount])

    const send = useCallback(async () => {
        disableSendBtn()
        const contentInput = editorRef.current?.getInstance().getMarkdown()
        try {
            if (!targetToken) throw new Error('No Token was selected')
            if (!isSignerReady(signer)) throw new Error('Please connect wallet')

            const sig = await signer._signTypedData(
                getEIP712Profile(targetToken.chainId),
                {
                    Requirement: [
                        { name: "token", type: "address" },
                        { name: "amount", type: "uint256" },
                    ],
                },
                {
                    token: targetToken.address,
                    amount: parsedAmount
                }
            );
            const { data } = await axios.post<UploadReturn>('/api/upload', {
                title,
                content: contentInput,
                owner: wallet.account,
                captchaValue,
                requirement: {
                    networkId: targetToken.chainId,
                    token: targetToken.address,
                    amount: parsedAmount.toString(),
                    sig,
                }
            })
            onSent(data)
        } catch (error) {
            alert('Error happened: ' + error)
        } finally {
            enableSendBtn()
        }
    }, [title, signer, targetToken, parsedAmount, onSent, editorRef, captchaValue])

    return <CreateSnippetContainer>
        <Input placeholder='Title for snippet (Optional)' width='100%' onChange={e => setTitle(e.target.value)} />
        <Editor
            initialValue={`## Sub Title (If you needed)
Content`}
        previewStyle="vertical"
        height="450px"
        initialEditType="markdown"
        useCommandShortcut={true}
        ref={editorRef}
        />
        <MarginedContainer>
            
        </MarginedContainer>
        <Grid.Container gap={2} justify="center">
            <Grid md={8}>
                <Description title="Which Token hodl to unlock?" content={
                <div style={{ display: 'flex' }}>
                    { targetToken && <User name={targetToken.symbol} src={targetToken.logoURI} /> }
                    <TokenSelector
                        onSelected={(profile) => {
                            setToken(profile)
                        }}>
                    { targetToken ? 'Change' : 'Select' }
                    </TokenSelector>
                </div>
                } />
            </Grid>
            <Grid md={8}>
                {/* {
                    targetToken &&  */}
                        <Description title="The Minimum hodl requirement:" content={
                            <Input placeholder="e.g 114514.1919" width="100%"
                                onChange={handleAmountInput}
                            />
                        } />
                {/* } */}
            </Grid>
            <Grid md={8}>
                <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY || ''}
                    onChange={setCatpchaVal}
                />
            </Grid>
            <Grid>
                <Button type="secondary" onClick={() => send()} loading={isSending}
                    disabled={isNotEnoughToSend}
                    >Post this snippet</Button>
            </Grid>
        </Grid.Container>
    </CreateSnippetContainer>
}