import { NextApiRequest, NextApiResponse } from "next"
import { ZERO_ADDRESS } from "../../../constant"
import { Requirement } from "../../../typing"

function getLimitOf(hash: string, res: NextApiResponse<Requirement>) {
    res.status(200).json({ token: ZERO_ADDRESS, amount: "114514191981000000000", networkId: 1 })
}
function setLimitOf(hash: string, body: any, res: NextApiResponse<any>) {
    throw new Error("Function not implemented.")
}
function removeLimitOf(hash: string, body: any, res: NextApiResponse<any>) {
    throw new Error("Function not implemented.")
}


async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { hash } = req.query as { hash: string }

    switch(req.method) {
        case 'GET': return getLimitOf(hash, res)
        case 'PUT': return setLimitOf(hash, req.body, res)
        case 'DELETE': return removeLimitOf(hash, req.body, res)
        default: return res.status(405).json({ message: 'Method Not Allowed' })
    }

}

export default handler;


