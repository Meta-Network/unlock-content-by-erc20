import axios from "axios";
import { BigNumber } from "ethers";
import { NextApiResponse } from "next";
import { Requirement } from "../typing";

export const KVClient = axios.create({
    baseURL: process.env.CLOUDFLARE_WORKER_KV_API,
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_WORKER_KV_ACCESSTOKEN}` },
});


export class WorkerKV {
    static async getRequirement(hash: string) {
        const { data } = await KVClient.get<{ data: Requirement | null }>(`/SNIPPETS_REQUIREMENT/${hash}`)
        return data.data
    }
    static async  setRequirement(hash: string, body: Requirement) {
        const { data } = await KVClient.put<{ success: boolean }>(`/SNIPPETS_REQUIREMENT/${hash}`, body)
        return data.success
    }
    static async removeRequirement(hash: string): Promise<boolean> {
        const { data } = await KVClient.delete(`/SNIPPETS_REQUIREMENT/${hash}`)
        return data.success
    }
}