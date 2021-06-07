export const getEIP712Profile = (chainId: number) => ({
    name: 'Ether Mail',
    version: '1',
    chainId,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
})