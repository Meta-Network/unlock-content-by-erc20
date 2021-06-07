import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { Requirement } from "../../../typing";

const KVClient = axios.create({
  baseURL: process.env.CLOUDFLARE_WORKER_KV_API,
  headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_WORKER_KV_ACCESSTOKEN}` },
});

async function getRequirement(hash: string, res: NextApiResponse) {
    const { data } = await KVClient.get<{ data: Requirement | null }>(`/SNIPPETS_REQUIREMENT/${hash}`)
    if (!data.data) res.status(404).json({ message: "Not found" })
    else res.status(200).json({ requirement: data.data })
}
async function setRequirement(hash: string, body: any, res: NextApiResponse<any>) {
    // @todo: check permission etc.
    const { data } = await KVClient.put<{ success: boolean }>(`/SNIPPETS_REQUIREMENT/${hash}`, body)
    if (data.success) res.status(201).json({ message: 'ok' })
    else res.status(400).json({ message: 'Unknown error' })
}
async function removeRequirement(hash: string, body: any, res: NextApiResponse<any>) {
    // @todo: check permission etc.
    const { data } = await KVClient.delete(`/SNIPPETS_REQUIREMENT/${hash}`)
    if (data.success) res.status(201).json({ message: 'ok' })
    else res.status(400).json({ message: 'Unknown error' })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query as { hash: string };

  switch (req.method) {
    case "GET":
      return getRequirement(hash, res);
    case "PUT":
      return setRequirement(hash, req.body, res);
    case "DELETE":
      return removeRequirement(hash, req.body, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default handler;
