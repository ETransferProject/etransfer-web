// test3
// const ETransferHost = 'http://192.168.64.151:5011';
// const AuthHost = 'http://192.168.64.151:8011';
// // const ApiHostV1 = 'http://192.168.66.203:5001';
// // const ApiHostV2 = 'http://192.168.67.127:5001';
// const GraphqlHostV1 = 'http://192.168.66.203:8083/AElfIndexer_DApp/PortKeyIndexerCASchema';
// const GraphqlHostV2 = 'http://192.168.67.99:8083/AElfIndexer_DApp/PortKeyIndexerCASchema';

// testnet
// const ETransferHost = 'https://test.etransfer.exchange';
// const AuthHost = 'https://test.etransfer.exchange';
// // const ApiHostV1 = 'https://did-portkey-test.portkey.finance';
// // const ApiHostV2 = 'https://aa-portkey-test.portkey.finance';
// const GraphqlHostV1 =
//   'https://dapp-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema';
// const GraphqlHostV2 =
//   'https://dapp-aa-portkey-test.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema';

// mainnet
const ETransferHost = 'https://etransfer.exchange';
const AuthHost = 'https://etransfer.exchange';
// const ApiHostV1 = 'https://dapp-portkey.portkey.finance';
// const ApiHostV2 = 'https://aa-portkey.portkey.finance';
const GraphqlHostV1 = 'https://dapp-portkey.portkey.finance/Portkey_DID/PortKeyIndexerCASchema';
const GraphqlHostV2 =
  'https://dapp-aa-portkey.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema';

module.exports = [
  {
    source: '/api/etransfer/:path*',
    destination: `${ETransferHost}/api/app/:path*`,
  },
  {
    source: '/connect/:path*',
    destination: `${AuthHost}/connect/:path*`,
  },
  // {
  //   source: '/portkeyV1/api/:path*',
  //   destination: `${ApiHostV1}/api/:path*`,
  // },
  // {
  //   source: '/portkeyV2/api/:path*',
  //   destination: `${ApiHostV2}/api/:path*`,
  // },
  {
    source: '/v1/graphql/:path*',
    destination: `${GraphqlHostV1}/graphql/:path*`,
  },
  {
    source: '/v2/graphql/:path*',
    destination: `${GraphqlHostV2}/graphql/:path*`,
  },
];
