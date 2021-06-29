import { Table, Text, Link, Button, Tooltip } from "@geist-ui/react";
import React from "react";
import { useMemo } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { PostMetadata } from "../../typing";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ChainId, ChainIdToName } from "../../constant";
import ArrowLeftCircle from '@geist-ui/react-icons/arrowLeftCircle'
import { useRouter } from "next/router";
dayjs.extend(relativeTime);


export default function MyPosts() {
    const router = useRouter()
    const [posts] = useLocalStorage<PostMetadata[]>('encrypted-posts', []);

    const formattedList = useMemo(() => {
        return posts.map(p => {
            return {
                ...p,
                hash: <Link href={`/${p.hash}`} target="_blank" color>{p.hash}</Link>,
                timestamp: dayjs().to(p.timestamp),
                type: p.requirement.type,
                author:
                    <Tooltip text={p.encrypted.owner}>
                        <Text>{p.encrypted.owner.slice(0, 6)}...{p.encrypted.owner.slice(-4)} </Text>
                    </Tooltip>,
                requirement: <> On {ChainIdToName[p.requirement.networkId as ChainId]}</>
            }
        })
    }, [posts]);
    return <div>
        <Button onClick={() => router.back()} auto icon={<ArrowLeftCircle />}>Back</Button>
        <Text h1>My Posts</Text>
        <Table data={formattedList}>
            <Table.Column prop="hash" label="Hash" />
            <Table.Column prop="author" label="Wallet" />
            <Table.Column prop="requirement" label="requirement" />
            <Table.Column prop="timestamp" label="Published at" />
        </Table>
    </div>
}