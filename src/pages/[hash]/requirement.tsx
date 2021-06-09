import React, { useMemo, useState } from "react";
import { Button, Input, Radio, Text, Description } from "@geist-ui/react";
import styled from "styled-components"
import useSWR from "swr";
import { BigNumber } from "@ethersproject/bignumber";
import { axiosSWRFetcher } from "../../utils";

const SetRequirementContainer = styled.div``
const BtnActions = styled.div``

export default function SetRequirementPage() {
    const [targetChainId, setTargetChain] = useState(1)
    const [targetToken, setToken] = useState('')

    const tokenListURI = useMemo(() => {
        switch (targetChainId) {
            case 1: return 'https://tokens.coingecko.com/uniswap/all.json';
            case 56: return 'https://tokens.pancakeswap.finance/pancakeswap-top-100.json';
            default: return null;
        }
    }, [targetChainId])

    const { data: tokenList } = useSWR(tokenListURI, axiosSWRFetcher)

    // const [minimumAmountToHodl, setMinimumAmountToHodl] = useState<BigNumber>(BigNumber.from(0))
    

    return <SetRequirementContainer>
        <Text h1>Set requirement to Unlock the snippet</Text>
        <Description title="Token On which Network?" content={
            <Radio.Group value={targetChainId} onChange={(val) => setTargetChain(Number(val))}>
                <Radio value={1}>ETH Mainnet</Radio>
                <Radio value={4}>Rinkeby</Radio>
                <Radio value={56}>BSC Mainnet</Radio>
                <Radio value={97}>BSC Testnet</Radio>
            </Radio.Group>
        } />
        { JSON.stringify(tokenList)}
        <Description title="Which Token hodl to unlock?" content={
            <Input placeholder="e.g 0x114514...1919810" onChange={e => setToken(e.target.value)} width="50%" />
        } />
        <Description title="The Minimum hodl requirement:" content={
            <Input placeholder="e.g 114514.1919" width="50%"
                // onChange={(e) => {
                // }}
            />
        } />
        <BtnActions>
            <Button type="secondary">Set</Button>
            <Button type="error">Remove</Button>
        </BtnActions>
    </SetRequirementContainer>
}