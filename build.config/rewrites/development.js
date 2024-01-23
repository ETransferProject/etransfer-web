// testnet
// const ETransferHost = 'https://test.etransfer.exchange';
// const ApiHost = 'https://did-portkey-test.portkey.finance';
// const GraphqlHost = 'https://dapp-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema';

// test3
const ETransferHost = 'http://192.168.64.151:5011';
const AuthHost = 'http://192.168.64.151:8011';
const ApiHost = 'http://192.168.66.203:5001';
const GraphqlHost = 'http://192.168.66.203:8083/AElfIndexer_DApp/PortKeyIndexerCASchema';

module.exports = [
  {
    source: '/api/etransfer/:path*',
    destination: `${ETransferHost}/api/:path*`,
  },
  {
    source: '/connect/:path*',
    destination: `${AuthHost}/connect/:path*`,
  },
  {
    source: '/api/:path*',
    destination: `${ApiHost}/api/:path*`,
  },
  {
    source: '/graphql/:path*',
    destination: `${GraphqlHost}/graphql/:path*`,
  },
];
