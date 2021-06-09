import React, { useCallback, useMemo, useState } from "react";
import { Button, Input, Radio, Text, Description, Card } from "@geist-ui/react";
import styled from "styled-components"
import useSWR, { mutate } from "swr";
import { BigNumber } from "@ethersproject/bignumber";
import axios from "axios";
import { axiosSWRFetcher } from "../../utils";
import TokenSelector from "../../components/TokenSelector";
import { Requirement, StandardTokenProfile } from "../../typing";
import { utils } from "ethers";
import { useRouter } from "next/router";

const SetRequirementContainer = styled.div``
const BtnActions = styled.div``

export default function SetRequirementPage() {
    const router = useRouter()
    const { hash } = router.query
    const [targetChainId, setTargetChain] = useState(56)
    const { data: currentRequirement, error } = useSWR(hash ? `/api/${hash}/requirement` : null, axiosSWRFetcher)
    const [targetToken, setToken] = useState<StandardTokenProfile | null>(null)

    const [minimumAmountToHodl, setMinimumAmountToHodl] = useState<BigNumber>(BigNumber.from(0))

    const handleAmountInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!targetToken) return
        try {
            const parsedAmount = utils.parseUnits(e.target.value, targetToken.decimals)
            setMinimumAmountToHodl(parsedAmount)
        } catch (error) {
            alert('Bad Element deteced, please check your number input.')
        }
    },[ targetToken ])
    
    const SetRequirement = useCallback(async () => {
        if (typeof hash !== 'string') return;
        if (!targetToken) {
            alert('No token was selected, canceled.')
            return;
        }
        // @todo: need sign
        await axios.put(`/api/${hash}/requirement`, {
            version: '20210609',
            type: 'hodl',
            networkId: targetChainId,
            token: targetToken?.address,
            amount: minimumAmountToHodl.toString()
        } as Requirement)
        alert('Requirement is set, the update will be good in 2 min.')
    }, [hash, targetToken, targetChainId, minimumAmountToHodl])

    const RmRequirement = useCallback(async () => {
        if (typeof hash !== 'string') return;
        await axios.delete(`/api/${hash}/requirement`)
        mutate(`/api/${hash}/requirement`)
        alert('Requirement is removed, the update will be good in 2 min.')
    }, [hash])

    return <SetRequirementContainer>
        <Text h1>Set requirement to Unlock the snippet</Text>
        <Description title="Token On which Network?" content={
            <Radio.Group value={targetChainId} onChange={(val) => setTargetChain(Number(val))}>
                <Radio value={1}>ETH Mainnet</Radio>
                {/* <Radio value={4}>Rinkeby</Radio> */}
                <Radio value={56}>BSC Mainnet</Radio>
                {/* <Radio value={97}>BSC Testnet</Radio> */}
            </Radio.Group>
        } />

        {currentRequirement && !error && <Card>
            <Text>Current Requirement: </Text>
            <Text>Minimum amount of hodl to unlock: {currentRequirement.requirement.amount} {currentRequirement.requirement.token}</Text>
            <Text>On ChainID {currentRequirement.requirement.networkId }</Text>
        </Card>}
        
        <Description title="Which Token hodl to unlock?" content={
            // <Input placeholder="e.g 0x114514...1919810" onChange={e => setToken(e.target.value)} width="50%" />
            <TokenSelector
                selectedChainId={targetChainId}
                onSelected={(profile) => {
                    setToken(profile)
                }} />
        } />
        { targetToken && <Description title="The Minimum hodl requirement:" content={
            <Input placeholder="e.g 114514.1919" width="50%"
                onChange={handleAmountInput}
            />
        } />}
        <BtnActions>
            <Button type="secondary" onClick={SetRequirement}>Set</Button>
            <Button type="error" onClick={RmRequirement}>Remove</Button>
        </BtnActions>
    </SetRequirementContainer>
}