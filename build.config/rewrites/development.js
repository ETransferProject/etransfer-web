// testnet
const ETransferHost = 'https://test-app.etransfer.exchange';
const AuthHost = 'https://test-app.etransfer.exchange';

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
