import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { SignerWalletAdapterProps } from '@solana/wallet-adapter-base';

export const configureAndSendCurrentTransaction = async (
  transaction: Transaction,
  connection: Connection,
  feePayer: PublicKey,
  signTransaction: SignerWalletAdapterProps['signTransaction'],
) => {
  // Step1: get latest block hash
  const blockHash = await connection.getLatestBlockhash();
  transaction.feePayer = feePayer;
  transaction.recentBlockhash = blockHash.blockhash;

  // Step2: sign transaction
  const signed = await signTransaction(transaction);

  // Step3: send transaction raw
  const signature = await connection.sendRawTransaction(signed.serialize());

  // Step4: confirm transaction
  await connection.confirmTransaction({
    blockhash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
    signature,
  });

  return signature;
};
