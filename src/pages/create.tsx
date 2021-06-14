import Head from 'next/head'
import dynamic from "next/dynamic";
import React, { useState } from 'react'
import { useWallet } from 'use-wallet'
import { Button, Text } from "@geist-ui/react";
import styles from '../styles/Home.module.css'
import { useRecoilState } from 'recoil';
import { chainIdState } from '../stateAtoms/chainId.atom';
import { ChainIdToName } from '../constant';
// dynamic load
const CreateSnippet = dynamic(() => import("../components/CreateSnippet"), { ssr: false }) ;
const SnippetCreated = dynamic(() => import('../components/SnippetCreated'), { ssr: false });


export default function CreateSnippetPage() {
  const wallet = useWallet()

  const [chainId, setChainId] = useRecoilState(chainIdState)

  const [uploadedHash, setUploadedHash] = useState('')

  if (uploadedHash) {
    return <SnippetCreated uploadedHash={uploadedHash} />
  }
    
  return (
    <div className={styles.container}>
      <Head>
        <title>Lock your content with Hodl</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {
        wallet.status !== 'connected' ?
          <>
            <Text h1>🤔 Please connect your wallet</Text>
            <Text h4>👮‍♀️ Because We'll need your signature to identify you. </Text>
                          <Text>🔐 We only require your digital signature on content hash. <br />
                              Feel free to <a href="https://eips.ethereum.org/EIPS/eip-712" target="_blank">check out tech spec</a> about Ethereum digital signature that we are using now.</Text>
            <p>Connected to Network: { ChainIdToName[chainId] || '❌ Not supported Network' }</p>
            <p>Connect Wallet by</p>
            <Button onClick={() => wallet.connect('injected')}>MetaMask</Button>
            {/* <button onClick={() => wallet.connect('walletconnect')}>Wallet Connect</button> */}
          </>
          : 
            <>
              <CreateSnippet onSent={async (res) => {
                setUploadedHash(res.hash)
              }} />

              {uploadedHash && <a href={`https://ipfs.fleek.co/ipfs/${uploadedHash}`} target="_blank">Go IPFS to See RAW</a>}
              {uploadedHash && <a href={`/${uploadedHash}`}>Decrypt and See</a>}

          </>
        }

      </main>

    </div>
  )
}
