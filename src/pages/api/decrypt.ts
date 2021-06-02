// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  content: string
}

type ReqeustData = {
    token: string; // must check is legit or not

    challenge: string; // something identifiable, like post slug / id / random code

    sig: {
        r: string;
        s: string;
        v: number;
    }
}

export default (req: NextApiRequest, res: NextApiResponse<Data>) => {
  res.status(200).json({ content: 'Hello World, this is a encrypted text' })
}
