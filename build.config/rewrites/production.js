// const commonHost = 'https://did-portkey.portkey.finance';

const ETransferHost = 'https://etransfer.exchange';

// const GraphqlHost = 'https://dapp-portkey.portkey.finance';

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
