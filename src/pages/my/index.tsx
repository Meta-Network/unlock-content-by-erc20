import { Table, Text, Link, Button, Tooltip } from "@geist-ui/react";
import React from "react";
import { useMemo } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { PostMetadata } from "../../typing";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Key, Delete } from '@geist-ui/react-icons'
import ArrowLeftCircle from '@geist-ui/react-icons/arrowLeftCircle'
import { useRouter } from "next/router";
import { RequirementRow } from "../../components/MyPost/RequirementRow";
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
                requirement: <RequirementRow requirement={p.requirement} hash={p.hash} />,
                actions: <div>
                    <Button onClick={() => alert(`Key is: ${p.privateKey}`)} auto icon={<Key />}></Button>
                    <Button type="error" onClick={() => alert(`Key is: ${p.privateKey}`)} auto icon={<Delete />}></Button>
                </div>
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
            <Table.Column prop="actions" label="Actions" />
        </Table>
    </div>
}