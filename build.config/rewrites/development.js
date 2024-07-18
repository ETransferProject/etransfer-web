// testnet
const ETransferHost = 'https://test-app-2.etransfer.exchange';
const AuthHost = 'https://test-app-2.etransfer.exchange';

module.exports = [
  {
    source: '/api/etransfer/:path*',
    destination: `${ETransferHost}/api/etransfer/:path*`, // testnet
  },
  {
    source: '/connect/:path*',
    destination: `${AuthHost}/connect/:path*`,
  },
];
