import Head from 'next/head'
import Image from 'next/image'
import React from 'react'
import styles from '../styles/Home.module.css'
import LandingPage from '../components/landing';


export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>(Un)Lock Content with Hodl</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <LandingPage />
      </main>

      <footer className={styles.footer}>
          Meta Network All Right Reserved.
      </footer>
    </div>
  )
}
