import { Card, Text } from "@geist-ui/react";
import { utils } from "ethers";
import React, { useMemo } from "react";
import { ChainId, ChainIdToName } from "../../constant";
import { useERC20 } from "../../hooks/useERC20";
import { Requirement } from "../../typing";

type ProfileCardParams = {
    currentRequirement?: Requirement
}

export function ProfileCard({ currentRequirement: requirement }: ProfileCardParams) {
    const { isProfileLoading, tokenProfile } = useERC20(requirement?.token)
    // not render anything if empty
    if (!requirement) return <></>
    if (isProfileLoading) return <p>Loading Profile</p>

    return <Card>
            <Text h4>Current Requirement: </Text>
            <Text>Minimum amount of hodl to unlock: {utils.formatUnits(requirement.amount, tokenProfile.decimals)} {tokenProfile.symbol}</Text>
            <Text>On Chain { ChainIdToName[requirement.networkId as ChainId] || requirement.networkId }</Text>
        </Card>
}