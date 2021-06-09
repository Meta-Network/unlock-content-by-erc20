import axios from "axios";
import { Requirement } from "../typing";

export const KVClient = axios.create({
  baseURL: process.env.CLOUDFLARE_WORKER_KV_API,
  headers: {
    Authorization: `Bearer ${process.env.CLOUDFLARE_WORKER_KV_ACCESSTOKEN}`,
  },
});

export class WorkerKV {
  /** CRUD on 解锁需求 */
  static async getRequirement(hash: string) {
    const { data } = await KVClient.get<{ data: Requirement | null }>(
      `/SNIPPETS_REQUIREMENT/${hash}`
    );
    return data.data;
  }
  static async setRequirement(hash: string, body: Requirement) {
    const { data } = await KVClient.put<{ success: boolean }>(
      `/SNIPPETS_REQUIREMENT/${hash}`,
      body
    );
    return data.success;
  }
  static async removeRequirement(hash: string): Promise<boolean> {
    const { data } = await KVClient.delete(`/SNIPPETS_REQUIREMENT/${hash}`);
    return data.success;
  }
  /** CRUD on 加密密钥 */
  static async getSecretKey(hash: string) {
    const { data } = await KVClient.get<{ data: { key: string } | null }>(
      `/SnippetToKey/${hash}`
    );
    return data.data?.key;
  }
  static async setSecretKey(hash: string, key: string) {
    const { data } = await KVClient.put<{ success: boolean }>(
      `/SnippetToKey/${hash}`,
      { key }
    );
    return data.success;
  }
  static async removeSecretKey(hash: string): Promise<boolean> {
    const { data } = await KVClient.delete(`/SnippetToKey/${hash}`);
    return data.success;
  }
}
