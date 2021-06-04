// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { recoverTypedSignature } from "eth-sig-util";
import { utils } from 'ethers';

type Data = {
  content: string
}

type ReqeustData = {
    token: string; // must check is legit or not
    challenge: string; // something identifiable, like post slug / id / random code
    sig: string;
}

export default (req: NextApiRequest, res: NextApiResponse<{ message: string } | Data>) => {
  if (req.method !== 'POST') {
    res.status(400).json({ message: 'use POST method instead' })
  }
  const { token, challenge, sig } = req.body as ReqeustData
  const recoveredWallet = recoverTypedSignature<{
    EIP712Domain: [
      {name:"name",type:"string"},
      {name:"version",type:"string"},
      {name:"chainId",type:"uint256"},
      {name:"verifyingContract",type:"address"}
    ],
    Request: [
      { name: 'token', type: 'address' },
      { name: 'challenge', type: 'string' },
    ],
  }>({
    data: {
      types: {
        EIP712Domain: [
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        Request: [
          { name: 'token', type: 'address' },
          { name: 'challenge', type: 'string' },
        ],
      },
      primaryType: 'Request',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 56,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      },
      message: {
          token,
          challenge
      }
    },
    sig 
  })
  try {
    const checksumedAddress = utils.getAddress(recoveredWallet)
    console.info('recoveredWallet', checksumedAddress);
    if (checksumedAddress !== '0x7fd97686785Cb93098FA25d0D6c47Cb0513B9A01') throw new Error('Bad User')

    res.status(200).json({ content: 'Hello World, this is a unlocked secret text' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
