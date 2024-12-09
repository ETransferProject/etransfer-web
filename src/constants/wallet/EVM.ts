import { Coinbase, Metamask, WalletConnect } from 'assets/images';
import { BlockchainNetworkType } from 'constants/network';

export const EVM_CREATE_TOKEN_CONTRACT_ADDRESS: Record<string, `0x${string}`> = {
  [BlockchainNetworkType.Arbitrum]: '0x',
  [BlockchainNetworkType.Avax]: '0x',
  [BlockchainNetworkType.BASE]: '0x',
  [BlockchainNetworkType.Binance]: '0x',
  [BlockchainNetworkType.Ethereum]: '0x',
  [BlockchainNetworkType.Optimism]: '0x',
  [BlockchainNetworkType.Polygon]: '0x',
  [BlockchainNetworkType.SETH]: '0x5F7f441F1d4123b144AB4cf108f248f2c1129172',
  [BlockchainNetworkType.TBinance]: '0x',
};

export enum EVM_CONTRACT_FUNCTION_NAME {
  transfer = 'transfer',
  createToken = 'createToken',
}

export const EVM_TOKEN_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: EVM_CONTRACT_FUNCTION_NAME.transfer,
    outputs: [], // { internalType: 'bool', name: '', type: 'bool' }
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const EVM_CREATE_TOKEN_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'symbol', type: 'string' },
      { internalType: 'uint256', name: 'initialSupply', type: 'uint256' },
    ],
    name: EVM_CONTRACT_FUNCTION_NAME.createToken,
    outputs: [], // { internalType: 'bool', name: '', type: 'bool' }
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const METAMASK_WALLET_ID = 'io.metamask'; // 'metaMaskSDK'
export const COINBASE_WALLET_ID = 'coinbaseWalletSDK'; // 'com.coinbase.wallet'
export const WALLET_CONNECT_ID = 'walletConnect';

export const EVM_WALLET_ALLOWANCE = [METAMASK_WALLET_ID, COINBASE_WALLET_ID, WALLET_CONNECT_ID];
export const TELEGRAM_EVM_WALLET_ALLOWANCE = [WALLET_CONNECT_ID];
export const PORTKEY_EVM_WALLET_ALLOWANCE = [WALLET_CONNECT_ID];
export const MOBILE_EVM_WALLET_ALLOWANCE = [COINBASE_WALLET_ID, WALLET_CONNECT_ID];

export const CONNECT_EVM_LIST_CONFIG = {
  section: 'EVM',
  list: [
    {
      name: 'MetaMask',
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
