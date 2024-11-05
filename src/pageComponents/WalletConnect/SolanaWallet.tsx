import { Button } from 'antd';
import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import bs58 from 'bs58';
import { configureAndSendCurrentTransaction } from 'utils/wallet/SOL';

const USDT_TOKEN_ADDRESS = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'; // Mainnet USDT
// const SOL_COBO_ADDRESS = '3iNnVFbTm9KBmsqe3pHqMijhCRDHtMdPvNEyN1wNmxgh';
const SOL_TO_ADDRESS = 'E4dh4YjnEihsu8MnfnnCmK16ADd9BNcwDoE1Y6jtdmeV';

export default function SolanaWallet() {
  const { connection } = useConnection();
  const { publicKey, connected, disconnect, select, signTransaction } = useWallet();

  const onConnectSolana = useCallback(
    (name: any) => {
      console.log('>>>>>> Solana onConnectSolana', '');
      select(name);
      // connect();
    },
    [select],
  );

  const onDisConnectSolana = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const onGetBalance = useCallback(async () => {
    if (publicKey) {
      const balance = await connection.getBalance(publicKey);
      const account = await connection.getAccountInfo(publicKey);
      console.log('>>>>>> Solana balance', balance, account);
    }
  }, [connection, publicKey]);

  const onCreateRawTransaction = useCallback(async () => {
    if (signTransaction && publicKey) {
      const toPublicKey = new PublicKey(SOL_TO_ADDRESS);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      console.log('>>>>>> SOL blockhash', blockhash);
      const usdtMint = new PublicKey(USDT_TOKEN_ADDRESS);

      // ====== send USDT ======
      const senderTokenAccount = await getAssociatedTokenAddress(
        usdtMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
      );
      const amount = 0.00000001;
      const transaction = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: publicKey,
      }).add(
        createTransferInstruction(
          senderTokenAccount,
          toPublicKey,
          publicKey,
          amount,
          [],
          TOKEN_PROGRAM_ID,
        ),
      );

      // ====== send SOL ======
      // const transaction = new Transaction({
      //   blockhash,
      //   lastValidBlockHeight,
      //   feePayer: publicKey,
      // }).add(
      //   SystemProgram.transfer({
      //     fromPubkey: publicKey,
      //     toPubkey: toPublicKey,
      //     lamports: 1, // 1 SOL = 1,000,000,000 lamports
      //   }),
      // );
      console.log('>>>>>> SOL transaction', transaction);
      const signedTransaction = await signTransaction(transaction);
      console.log('>>>>>> SOL signedTransaction', signedTransaction);
      const serializedTransaction = signedTransaction.serialize();
      const base58Transaction = bs58.encode(serializedTransaction);
      console.log('>>>>>> SOL Base58 Transaction:', base58Transaction);
    }
  }, [connection, publicKey, signTransaction]);

  const onSendTransaction = useCallback(async () => {
    try {
      if (signTransaction && publicKey) {
        const toPublicKey = new PublicKey(SOL_TO_ADDRESS);
        const usdtMint = new PublicKey(USDT_TOKEN_ADDRESS);

        // ====== send USDT ======
        const transactionInstructions: TransactionInstruction[] = [];
        const senderTokenAccount = await getAssociatedTokenAddress(
          usdtMint,
          publicKey,
          // false,
          // TOKEN_PROGRAM_ID,
        );
        const fromAccount = await getAccount(connection, senderTokenAccount);
        console.log('>>>>>> SOL fromAccount', fromAccount);
        const associatedTokenTo = await getAssociatedTokenAddress(usdtMint, toPublicKey);
        console.log('>>>>>> SOL associatedTokenTo', associatedTokenTo);
        if (!(await connection.getAccountInfo(associatedTokenTo))) {
          transactionInstructions.push(
            createAssociatedTokenAccountInstruction(
              publicKey,
              associatedTokenTo,
              toPublicKey,
              usdtMint,
            ),
          );
        }
        transactionInstructions.push(
          createTransferInstruction(
            fromAccount.address, // source
            associatedTokenTo, // destination
            publicKey,
            10000, // amount, transfer 1 USDT, USDT on solana devnet has 6 decimal
          ),
        );
        const transaction = new Transaction().add(...transactionInstructions);
        const signature = await configureAndSendCurrentTransaction(
          transaction,
          connection,
          publicKey,
          signTransaction,
        );
        console.log('>>>>>> SOL signature', signature);
      }
    } catch (error) {
      console.log('>>>>>> SOL error', error);
    }
  }, [connection, publicKey, signTransaction]);

  return (
    <div>
      {!connected ? (
        <>
          {/* <WalletMultiButton />
          <WalletDisconnectButton /> */}
          <Button onClick={() => onConnectSolana('Phantom')}>Connect Phantom</Button>
          <Button onClick={() => onConnectSolana('Solflare')}>Connect Solflare</Button>
        </>
      ) : (
        <>
          <p>Current Address: {publicKey?.toString()}</p>
          <Button onClick={onDisConnectSolana}>DisConnect Solana</Button>
          <Button onClick={onGetBalance}>getBalance</Button>
          <Button onClick={onCreateRawTransaction}>Raw Transaction</Button>
          <Button onClick={onSendTransaction}>Send Transaction</Button>
        </>
      )}
    </div>
  );
}
