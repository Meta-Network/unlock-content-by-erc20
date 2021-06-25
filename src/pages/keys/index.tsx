import { Button, Code, Input, Text } from "@geist-ui/react";
import * as openpgp from 'openpgp'
import React, { useCallback } from "react";
import { useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

type PublicKey = string;
type Privatekey = string;
type RevocationCertificate = string;
type KeyType = 'ecc' | 'rsa';

type KeyPair = {
    type: KeyType;
    name?: string;

    publicKey: PublicKey;
    privatekey: Privatekey;
    revocationCertificate: RevocationCertificate;
    userIDs: openpgp.UserID | openpgp.UserID[]
}

export default function KeysManagement() {
    const [keys, setKeys] = useLocalStorage<KeyPair[]>('KeyPairs', []);
    const [name, setName] = useState('')
    const [passphrase, setPassphrase] = useState('')

    const generateKeyPair = useCallback(async (type: KeyType = 'ecc') => {
        const userIDs = [{ name: 'Jon Smith', email: 'jon@example.com' }]
        const {privateKeyArmored, publicKeyArmored, revocationCertificate} = await openpgp.generateKey({
            type, // Type of the key, defaults to ECC
            curve: 'curve25519', // ECC curve name, defaults to curve25519
            userIDs: userIDs, // you can pass multiple user IDs
            passphrase
        })

        setKeys([...keys, {
            type,
            name,
            privatekey: privateKeyArmored,
            publicKey: publicKeyArmored,
            revocationCertificate,
            userIDs
        }])
        setName('')
        setPassphrase('')
    }, [passphrase, name])

    return <div>
        <Text h1>Key Pair Management</Text>
        <Input onChange={e => setName(e.target.value)} value={name} width="100%"
            placeholder='Enter the name to identify the key... (Optional)'  />
        <Input onChange={e => setPassphrase(e.target.value)} value={passphrase} width="100%"
            placeholder='Enter the Password that protect your keys...' />
        <Button onClick={() => generateKeyPair()}>Add ➕</Button>
        <Text h4>{keys.length} Key{ keys.length > 1 ? 's' : ''} are stored</Text>
        <Code>{JSON.stringify(keys, null, 2)}</Code>
    </div>
}