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
  //   destination: 'http://192.168.66.203:5001/api/:path*',
  // },
  // {
  //   source: '/graphql/:path*',
  //   destination:
  //     'http://192.168.66.203:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql/:path*',
  // },
];
