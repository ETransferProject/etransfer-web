import { Coinbase, Metamask, WalletConnect } from 'assets/images';

export const EVM_TO_ADDRESS = '0x08915f275100dfEc26f63624EEACdD41E4040CC0';
// export const EVM_USDT_CONTRACT_ADDRESS_MAINNET = '0xdac17f958d2ee523a2206206994597c13d831ec7';
export const EVM_USDT_CONTRACT_ADDRESS_SEPOLIA = '0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679';
// export const EVM_ELF_CONTRACT_ADDRESS = '0x8add57b8ad6c291bc3e3fff89f767fca08e0e7ab';
export const EVM_USDT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [], // { internalType: 'bool', name: '', type: 'bool' }
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const METAMASK_WALLET_ID = 'io.metamask'; // 'metaMaskSDK'
export const COINBASE_WALLET_ID = 'coinbaseWalletSDK'; // 'com.coinbase.wallet'
export const WALLET_CONNECT_ID = 'walletConnect';

export const EVM_WALLET_ALLOWANCE = [METAMASK_WALLET_ID, COINBASE_WALLET_ID, WALLET_CONNECT_ID];

export const CONNECT_EVM_LIST_CONFIG = {
  section: 'EVM',
  list: [
    {
      name: 'Metamask',
      key: METAMASK_WALLET_ID,
      icon: Metamask,
    },
    {
      name: 'Coinbase Wallet',
      key: COINBASE_WALLET_ID,
      icon: Coinbase,
    },
    {
      name: 'WalletConnect',
      key: WALLET_CONNECT_ID,
      icon: WalletConnect,
    },
  ],
};
