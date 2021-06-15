import React, { useMemo, useState, PropsWithChildren } from "react";
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { StandardTokenProfile } from "../typing";
import style from "./styles/TokenSelector.module.css";
import { Button, Grid, Input, Modal, Text, Tooltip, useModal, User } from "@geist-ui/react";
import QuestionCircle from '@geist-ui/react-icons/questionCircle'
import { utils } from "ethers";
import { ChainId, ChainIdToName, ZERO_ADDRESS } from "../constant";
import { useERC20 } from "../hooks/useERC20";
import { useRecoilValue } from "recoil";
import { currentTokenList } from "../stateAtoms/tokenList.atom";

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

    // const tokenListURI = useMemo(() => {
    //     switch (selectedChainId) {
    //         case 1: return 'https://gateway.ipfs.io/ipns/tokens.uniswap.org';
    //         case 56: return 'https://unpkg.com/@lychees/default-token-list@1.1.10/build/uniscam-default.tokenlist.json';
    //         default: return null;
    //     }
    // }, [selectedChainId])

    // const { data } = useSWR(tokenListURI, axiosSWRFetcher)
    const filteredTokenList = useRecoilValue(currentTokenList)

    const tokensOnCurrentChain = useMemo(() => {
        if (searchInput === '') return filteredTokenList
        else if (isContractAddress) {
            const findInList = filteredTokenList.find((t) => utils.getAddress(t.address) === utils.getAddress(searchInput))
            if (findInList) return [findInList]
            if (tokenProfile.tokenAddress === ZERO_ADDRESS) return []
            return [{
                chainId: selectedChainId,
                address: searchInput,
                logoURI: 'https://raw.githubusercontent.com/ant-design/ant-design-icons/master/packages/icons-svg/svg/outlined/question-circle.svg',
                name: tokenProfile.name,
                symbol: tokenProfile.symbol,
                decimals: tokenProfile.decimals
            }] as StandardTokenProfile[]
        } else {
            // is search on name then, go
            return filteredTokenList.filter(t => t.name.includes(searchInput) || t.symbol.includes(searchInput))
        }

    }, [filteredTokenList, selectedChainId, searchInput, isContractAddress, tokenProfile])

    // if (!filteredTokenList) return <p>Loading Token List...</p>

    return (
        <>
        <Button auto onClick={() => setVisible(true)}>{ children || 'Select Token'}</Button>
        <Modal {...bindings}>
            <Modal.Title>Select Token</Modal.Title>
                <Modal.Subtitle>
                    👛 List for Chain: {ChainIdToName[selectedChainId as ChainId] || 'Not Supported'}
                    <Tooltip
                        text={'If you want to switch your network, switch that in your wallet'}>
                        <QuestionCircle size="0.875rem" />
                    </Tooltip>
                </Modal.Subtitle>
            <Modal.Content>
                <Input placeholder="Search by name or paste address..."
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={style.searchInput}
                        width="100%" />
                    <Grid.Container gap={2} justify="center" className={style.tokenListContainer}>
                        { tokensOnCurrentChain.length === 0 && isContractAddress && <p>Searching... If you wait too long, please make sure that address is right, or check your network.</p> }
                        {
                            tokensOnCurrentChain.map(token =>
                                <Grid xs className={style.clickable} onClick={() => {
                                        onSelected(token)
                                        setVisible(false)
                                }}
                                    key={token.address}
                                >
                                    <User src={token.logoURI} name={token.symbol} >
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