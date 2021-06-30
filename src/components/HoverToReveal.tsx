import { Tooltip, Text } from "@geist-ui/react";
import React from "react";

type HoverToRevealFullParams = {
    text: string;
    front?: number;
    back?: number;
}

export function HoverToReveal({ text, front = 0, back = 6 }: HoverToRevealFullParams) {
    return <Tooltip text={text}>
        <Text>{text.slice(0, front)}{front !== 0 && '...'}{text.slice(-back)}</Text>
    </Tooltip>
}