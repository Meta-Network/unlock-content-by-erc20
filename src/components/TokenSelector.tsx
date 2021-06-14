import React, { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { StandardTokenList, StandardTokenProfile, UploadReturn } from "../typing";
import { useWallet } from "use-wallet";
import { Button, Select } from "@geist-ui/react";
import { useBoolean } from "ahooks";
import styled from "styled-components";
import useSWR from "swr";
import { axiosSWRFetcher } from "../utils";

type TokenSelectorParams = {
    selectedChainId: number;
    // callback
    onSelected: (obj: StandardTokenProfile) => void
}

const PageContainer = styled.div`
max-width: 100%;
`

export default function TokenSelector({ onSelected, selectedChainId }: TokenSelectorParams) {
    const tokenListURI = useMemo(() => {
        switch (selectedChainId) {
            case 1: return 'https://gateway.ipfs.io/ipns/tokens.uniswap.org';
            case 56: return 'https://unpkg.com/@lychees/default-token-list@1.1.10/build/uniscam-default.tokenlist.json';
            default: return null;
        }
    }, [selectedChainId])

    const { data } = useSWR(tokenListURI, axiosSWRFetcher)

    const tokensOnCurrentChain = useMemo(() => {
        if (!data) return []
        return (data as StandardTokenList).tokens.filter(t => t.chainId === selectedChainId)
    }, [data, selectedChainId])

    const onTokenSelected = useCallback((address: string) => {
        const targetToken = tokensOnCurrentChain.find((val) => val.address === address);
        if (targetToken) onSelected(targetToken)
    }, [tokensOnCurrentChain, onSelected])

    if (!data) return <p>Loading Token List...</p>

    return <PageContainer>
        <Select placeholder="Select Token" onChange={v => onTokenSelected(v as string)}>
            {
                tokensOnCurrentChain.map(token =>
                    <Select.Option
                        value={token.address}
                        key={token.address}
                    >{token.name} - {token.symbol}</Select.Option>
                )
            }
        </Select>
    </PageContainer>
}