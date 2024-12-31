import { Connection, PublicKey, Signer, Transaction } from '@solana/web3.js';
import { SignerWalletAdapterProps } from '@solana/wallet-adapter-base';

export const configureAndSendCurrentTransaction = async (
  transaction: Transaction,
  connection: Connection,
  feePayer: PublicKey,
  signTransaction: SignerWalletAdapterProps['signTransaction'],
  mintKeypair?: Signer,
) => {
  const blockHash = await connection.getLatestBlockhash();
  transaction.feePayer = feePayer;
  transaction.recentBlockhash = blockHash.blockhash;
  console.log('mintKeypair', mintKeypair, mintKeypair?.publicKey.toString());
  if (mintKeypair) {
    transaction.partialSign(mintKeypair);
  }
  const signed = await signTransaction(transaction);
  console.log('signed', signed);
  const signature = await connection.sendRawTransaction(signed.serialize());
  console.log('signature', signature);
  await connection.confirmTransaction({
    blockhash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
    signature,
  });
  return signature;
};
