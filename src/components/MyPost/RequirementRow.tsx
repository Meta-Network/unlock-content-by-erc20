import { Button, Link } from "@geist-ui/react"
import { utils } from "ethers"
import React from "react"
import { ChainId, ChainIdToName } from "../../constant"
import { useERC20 } from "../../hooks/useERC20"
import { Requirement } from "../../typing"

type RequirementRowParams = {
    hash: string;
    requirement: Requirement;
}

export function RequirementRow({ requirement, hash }: RequirementRowParams) {
    const { isProfileLoading, tokenProfile } = useERC20(requirement.token, requirement.networkId)
    if (isProfileLoading) return <div>Loading...</div>
    return <div>
        {utils.formatUnits(requirement.amount, tokenProfile.decimals)} {tokenProfile.symbol}
        <br />On {ChainIdToName[requirement.networkId as ChainId]}
        <br /><Link href={`/${hash}/requirement`} target="_blank" color>Change</Link>
    </div>
}