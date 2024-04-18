import { NetworkType } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';

export type TNetworkConfig = {
  networkType: NetworkType;
  mainChainId: ChainId;
  sideChainId: ChainId;
  eTransferRequestUrl: string;
  eTransferConnectUrl: string;
  webLoginNetworkType: 'MAIN' | 'TESTNET';
  webLoginGraphqlUrl: string;
  webLoginRequestDefaultsUrl: string;
  webLoginConnectUrl: string;
  eTransferContractAddress: string;
  whitelistContractAddress: string;
  mainChainInfo: {
    chainId: string;
    exploreUrl: string;
    endPoint: string;
    caContractAddress: string;
    tokenContractAddress: string;
  };
  sideChainInfo: {
    chainId: string;
    exploreUrl: string;
    endPoint: string;
    caContractAddress: string;
    tokenContractAddress: string;
  };
};

const ETRANSFER_CONTRACT_ADDRESS = process.env.REACT_APP_ETRANSFER_CONTRACT_ADDRESS;
const WHITELIST_CONTRACT_ADDRESS = process.env.REACT_APP_WHITELIST_CONTRACT_ADDRESS;

const NETWORK_CONFIG_LIST: Record<string, TNetworkConfig> = {
  mainnet: {
    networkType: 'MAINNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVV',
    eTransferRequestUrl: 'https://eTransfer.finance',
    eTransferConnectUrl: 'https://eTransfer.finance',
    webLoginNetworkType: 'MAIN',
    webLoginGraphqlUrl:
      'https://dapp-aa-portkey.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: 'https://aa-portkey.portkey.finance',
    webLoginConnectUrl: 'https://auth-aa-portkey.portkey.finance',
    eTransferContractAddress: '', // todo
    whitelistContractAddress: '', // todo
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: 'https://explorer.aelf.io/',
      endPoint: 'https://aelf-public-node.aelf.io',
      caContractAddress: '2UthYi7AHRdfrqc1YCfeQnjdChDLaas65bW4WxESMGMojFiXj9',
      tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    },
    sideChainInfo: {
      chainId: 'tDVV',
      exploreUrl: 'https://tdvv-explorer.aelf.io/',
      endPoint: 'https://tdvv-public-node.aelf.io',
      caContractAddress: '2UthYi7AHRdfrqc1YCfeQnjdChDLaas65bW4WxESMGMojFiXj9',
      tokenContractAddress: '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX',
    },
  },
  testnet: {
    networkType: 'TESTNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVW',
    eTransferRequestUrl: 'https://test.eTransfer.finance',
    eTransferConnectUrl: 'https://test.eTransfer.finance',
    webLoginNetworkType: 'TESTNET',
    webLoginGraphqlUrl:
      'https://dapp-aa-portkey-test.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: 'https://aa-portkey-test.portkey.finance',
    webLoginConnectUrl: 'https://auth-aa-portkey-test.portkey.finance',
    eTransferContractAddress:
      ETRANSFER_CONTRACT_ADDRESS || '2EbbUpZLds58keVZPJDLPRbPpxzUYCcjooq6LBiBoRXVTFZTiQ',
    whitelistContractAddress:
      WHITELIST_CONTRACT_ADDRESS || '25VDxYFNxujPnPzqzkHxveegoV9wYm5zY72Hv6L7utD1kKu2jZ',
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: 'https://explorer-test.aelf.io/',
      endPoint: 'https://aelf-test-node.aelf.io',
      caContractAddress: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    },
    sideChainInfo: {
      chainId: 'tDVW',
      exploreUrl: 'https://explorer-test-side02.aelf.io/',
      endPoint: 'https://tdvw-test-node.aelf.io',
      caContractAddress: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      tokenContractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
    },
  },
  dev: {
    networkType: 'TESTNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVW',
    eTransferRequestUrl: '',
    eTransferConnectUrl: '',
    webLoginNetworkType: 'TESTNET',
    webLoginGraphqlUrl:
      'https://dapp-aa-portkey-test.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: 'https://aa-portkey-test.portkey.finance',
    webLoginConnectUrl: 'https://auth-aa-portkey-test.portkey.finance',
    eTransferContractAddress: '2EbbUpZLds58keVZPJDLPRbPpxzUYCcjooq6LBiBoRXVTFZTiQ',
    whitelistContractAddress: '25VDxYFNxujPnPzqzkHxveegoV9wYm5zY72Hv6L7utD1kKu2jZ',
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: 'https://explorer-test.aelf.io/',
      endPoint: 'https://aelf-test-node.aelf.io',
      caContractAddress: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    },
    sideChainInfo: {
      chainId: 'tDVW',
      exploreUrl: 'https://explorer-test-side02.aelf.io/',
      endPoint: 'https://tdvw-test-node.aelf.io',
      caContractAddress: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      tokenContractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
    },
  },
};

export const NETWORK_CONFIG = NETWORK_CONFIG_LIST[process.env.REACT_APP_NETWORK_KEY || 'testnet'];

export const DEFAULT_CHAIN_ID =
  NETWORK_CONFIG_LIST[process.env.REACT_APP_NETWORK_KEY || 'testnet'].sideChainId;
