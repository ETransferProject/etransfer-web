// const commonHost = 'https://did-portkey-test.portkey.finance';

const ETransferHost = 'https://test.etransfer.exchange';

// const GraphqlHost = 'https://dapp-portkey-test.portkey.finance';

module.exports = [
  {
    source: '/api/etransfer/:path*',
    destination: `${ETransferHost}/api/etransfer/:path*`,
  },
  // {
  //   source: '/api/:path*',
  //   destination: `${commonHost}/api/:path*`,
  // },
  // {
  //   source: '/graphql/:path*',
  //   destination: `${GraphqlHost}/Portkey_DID/PortKeyIndexerCASchema/graphql/:path*`,
  // },
];
