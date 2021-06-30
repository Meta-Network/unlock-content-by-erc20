import { utils } from "ethers"
import { ChainId, ChainIdToName } from "../../constant"
import { useERC20 } from "../../hooks/useERC20"
import { Requirement } from "../../typing"

type RequirementRowParams = {
    requirement: Requirement;
}

export function RequirementRow({ requirement }: RequirementRowParams) {
    const { isProfileLoading, tokenProfile } = useERC20(requirement.token, requirement.networkId)
    if (isProfileLoading) return <div>Loading...</div>
    return <div>
        {utils.formatUnits(requirement.amount, tokenProfile.decimals)} {tokenProfile.symbol}
        <br />On {ChainIdToName[requirement.networkId as ChainId]}
    </div>
}