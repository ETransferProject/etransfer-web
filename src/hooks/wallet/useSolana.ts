import { useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletTypeEnum } from 'context/Wallet/types';
import { getAuthPlainTextOrigin } from 'utils/auth';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { configureAndSendCurrentTransaction } from 'utils/wallet/SOL';
import { timesDecimals, ZERO } from '@etransfer/utils';

export default function useSolana() {
  const { connection } = useConnection();
  const {
    publicKey,
    connected,
    connecting,
    disconnect,
    select,
    signMessage,
    signTransaction,
    wallet,
  } = useWallet();

  const getBalance = useCallback(
    async ({ tokenContractAddress }: { tokenContractAddress: string }) => {
      if (!publicKey) return '';
      const tokenAddress = new PublicKey(tokenContractAddress);
      const senderTokenAccount = await getAssociatedTokenAddress(
        tokenAddress,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
      );
      const { value } = await connection.getTokenAccountBalance(senderTokenAccount);
      // amount,decimals

      return value;
    },
    [connection, publicKey],
  );

  const getSignMessage = useCallback(async () => {
    if (!signMessage) return '';

    const plainTextOrigin = getAuthPlainTextOrigin();
    const encoder = new TextEncoder();
    const message = encoder.encode(plainTextOrigin);
    const res = await signMessage(message);
    console.log('>>>>>> Solana res', res);
    return res;
  }, [signMessage]);

  const sendTransaction = useCallback(
    async ({
      tokenContractAddress,
      toAddress,
      amount,
      decimals,
    }: {
      tokenContractAddress: string;
      toAddress: string;
      amount: string;
      decimals: number;
    }) => {
      if (!signTransaction || !publicKey) return '';

      const toPublicKey = new PublicKey(toAddress);
      const tokenContractPublicKey = new PublicKey(tokenContractAddress);

      const transactionInstructions: TransactionInstruction[] = [];
      const senderTokenAccount = await getAssociatedTokenAddress(
        tokenContractPublicKey,
        publicKey,
        // false,
        // TOKEN_PROGRAM_ID,
      );
      const fromAccount = await getAccount(connection, senderTokenAccount);
      console.log('>>>>>> SOL fromAccount', fromAccount);
      const associatedTokenTo = await getAssociatedTokenAddress(
        tokenContractPublicKey,
        toPublicKey,
      );
      console.log('>>>>>> SOL associatedTokenTo', associatedTokenTo);
      if (!(await connection.getAccountInfo(associatedTokenTo))) {
        transactionInstructions.push(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenTo,
            toPublicKey,
            tokenContractPublicKey,
          ),
        );
      }
      const amountFormat = timesDecimals(ZERO.plus(amount), decimals).toNumber();
      transactionInstructions.push(
        createTransferInstruction(
          fromAccount.address, // source
          associatedTokenTo, // destination
          publicKey,
          amountFormat, // amount, transfer 1 USDT, USDT on solana devnet has 6 decimal
        ),
      );
      const transaction = new Transaction().add(...transactionInstructions);
      const signature = await configureAndSendCurrentTransaction(
        transaction,
        connection,
        publicKey,
        signTransaction,
      );
      return signature;
    },
    [connection, publicKey, signTransaction],
  );

  const solanaContext = useMemo(() => {
    return {
      isConnecting: connecting,
      isConnected: connected,
      walletType: WalletTypeEnum.SOL,
      account: publicKey?.toString(),
      accounts: [publicKey?.toString()],
      connector: wallet?.adapter,
      connect: select,
      disconnect: disconnect,
      getAccountInfo: connection.getAccountInfo,
      getBalance: getBalance,
      signMessage: getSignMessage,
      sendTransaction,
    };
  }, [
    connected,
    connecting,
    connection.getAccountInfo,
    disconnect,
    getBalance,
    getSignMessage,
    publicKey,
    select,
    sendTransaction,
    wallet?.adapter,
  ]);

  return solanaContext;
}
