import EVMWallet from './EVMWallet';
import SolanaWallet from './SolanaWallet';
import TONWallet from './TONWallet';
import TRONWallet from './TRONWallet';

export default function WalletConnect() {
  return (
    <div style={{ padding: 50 }}>
      <h2 style={{ marginTop: 24, marginBottom: 12 }}>EVM</h2>
      <EVMWallet />

      <h2 style={{ marginTop: 24, marginBottom: 12 }}>Solana</h2>
      <SolanaWallet />

      <h2 style={{ marginTop: 24, marginBottom: 12 }}>TON</h2>
      <TONWallet />

      <h2 style={{ marginTop: 24, marginBottom: 12 }}>TRON</h2>
      <TRONWallet />
    </div>
  );
}
