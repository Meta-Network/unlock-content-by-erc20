import Head from 'next/head'
import React, {  } from 'react'
import { Button, Text } from "@geist-ui/react";
import styles from '../styles/Home.module.css'
import styled from 'styled-components';

type Params = {
    uploadedHash: string;
}

const ActionsCard = styled.div`
    align-items: center;
    text-align: center;
    button {
        margin: 4px;
    }
`

export default function SnippetCreated({ uploadedHash , ...params}: Params) {
    return <div className={styles.container}>
      <Head>
        <title>Unlock Content by ERC20</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Text h1>
          🎉 Upload successfully 🎉  
        </Text>
        <Text h4>
          You can share your snippet now or <a href={`/${uploadedHash}`}>just have a look 👀</a>
        </Text>
        <ActionsCard>
          <Button shadow type="secondary">🔒 Lock with requirement</Button>
          <Button shadow auto> 🔗 Copy Link & Share </Button>
          <Button shadow onClick={() => window.location.reload()} >🙋 Post another snippet</Button>
        </ActionsCard>
      </main>
      </div>
}