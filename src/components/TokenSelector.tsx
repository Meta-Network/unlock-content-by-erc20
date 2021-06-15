import React, { useMemo, useState, PropsWithChildren } from "react";
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { StandardTokenList, StandardTokenProfile } from "../typing";
import { Button, Grid, Input, Modal, Text, useModal, User } from "@geist-ui/react";
import useSWR from "swr";
import { axiosSWRFetcher } from "../utils";
import { utils } from "ethers";
import { ChainId, ChainIdToName } from "../constant";
import { useERC20 } from "../hooks/useERC20";

type TokenSelectorParams = {
    selectedChainId: number;
    // callback
    onSelected: (obj: StandardTokenProfile) => void
}


export default function TokenSelector({ onSelected, selectedChainId, children }: PropsWithChildren<TokenSelectorParams>) {
    const { visible, setVisible, bindings } = useModal()
    const [searchInput, setSearchInput] = useState('')

    const isContractAddress = useMemo(() => utils.isAddress(searchInput), [searchInput]);
    const { tokenProfile } = useERC20(isContractAddress ? searchInput : null, selectedChainId)

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

        const onlyThisChain = (data as StandardTokenList).tokens.filter(t => t.chainId === selectedChainId)

        if (searchInput === '') return onlyThisChain
        else if (isContractAddress) {
            // @todo: should be the input token only
            const findInList = onlyThisChain.find((t) => utils.getAddress(t.address) === utils.getAddress(searchInput))
            if (findInList) return [findInList]
            if (!tokenProfile) return []
            return [{
                chainId: selectedChainId,
                address: searchInput,
                logoURI: 'https://raw.githubusercontent.com/ant-design/ant-design-icons/master/packages/icons-svg/svg/outlined/question-circle.svg',
                name: tokenProfile.name,
                symbol: tokenProfile.symbol,
            }] as StandardTokenProfile[]
        } else {
            // is search on name then, go
            return onlyThisChain.filter(t => t.name.includes(searchInput) || t.symbol.includes(searchInput))
        }

    }, [data, selectedChainId, searchInput, isContractAddress, tokenProfile])

    // const onTokenSelected = useCallback((address: string) => {
    //     const targetToken = tokensOnCurrentChain.find((val) => val.address === address);
    //     if (targetToken) onSelected(targetToken)
    // }, [tokensOnCurrentChain, onSelected])

    if (!data) return <p>Loading Token List...</p>

    return (
        <>
        <Button auto onClick={() => setVisible(true)}>{ children || 'Select Token'}</Button>
        <Modal {...bindings}>
            <Modal.Title>Select Token</Modal.Title>
                <Modal.Subtitle>
                    Current List: xxxxxxx Change List<br />
                    👛 Current Chain: {ChainIdToName[selectedChainId as ChainId] || 'Not Supported'}
                </Modal.Subtitle>
            <Modal.Content>
                <Input placeholder="Search by name or paste address..."
                    onChange={(e) => setSearchInput(e.target.value)}
                        width="100%" />
                    <Grid.Container gap={2} justify="center" style={{ marginTop: '1rem' }}>
                        {
                            tokensOnCurrentChain.map(token =>
                                <Grid xs>
                                    <User src={token.logoURI} name={token.symbol} onClick={() => {
                                        onSelected(token)
                                        setVisible(false)
                                    }}>
                                        <Text>{ token.address.slice(0,6) }...{ token.address.slice(-4) }</Text>
                                    </User>
                                </Grid>
                            )
                        }
                    </Grid.Container>
            </Modal.Content>
            <Modal.Action passive onClick={() => setVisible(false)}>Close</Modal.Action>
        </Modal>
        </>
    )
}