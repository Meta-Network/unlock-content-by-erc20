import styled from "styled-components"
import React, { } from "react";
import PlusSquare from '@geist-ui/react-icons/plusSquare'
import QuestionCircle from '@geist-ui/react-icons/questionCircle'
import { Button, Text } from "@geist-ui/react";
import Link from "next/link";

const LandingPageContainer = styled.div``
const HeaderPart = styled.div``
const FeaturesDisplays = styled.div``
const ActionBtns = styled.div`
button {
    margin-right: 1rem;
}`


export default function LandingPage() {
    return <LandingPageContainer>
        <HeaderPart>
            <Text h1>
                HodLock - (Un)Lock with Hodl
            </Text>
            <Text h4 type="secondary">
                Encrypt your article / snippet and set a Proof of Hodl (POH) requirement for content unlock!
            </Text>
            <Text p>We currently supported some tokens for Ethereum Mainnet and BSC Mainnet.</Text>
            <ActionBtns>
                <Link href="/create">
                    <Button type="secondary" icon={<PlusSquare />}>Create One</Button>
                </Link>
                <Link href="/faq">
                    <Button auto icon={<QuestionCircle />}>FAQ</Button>
                </Link>
                </ActionBtns>
        </HeaderPart>
        <FeaturesDisplays>
        </FeaturesDisplays>
    </LandingPageContainer>
}