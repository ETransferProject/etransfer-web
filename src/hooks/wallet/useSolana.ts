import { useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { IGetBalanceRequest, ISignMessageResult, WalletTypeEnum } from 'context/Wallet/types';
import { getAuthPlainText } from 'utils/auth';
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
import AElf from 'aelf-sdk';
import { AuthTokenSource } from 'types/api';
import { SendSolanaTransactionParams } from 'types/wallet';
import { WalletName } from '@solana/wallet-adapter-base';
import { stringToHex } from 'utils/format';

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
    async ({ tokenContractAddress }: IGetBalanceRequest) => {
      if (!publicKey) return '';
      const tokenAddress = new PublicKey(tokenContractAddress);
      const senderTokenAccount = await getAssociatedTokenAddress(
        tokenAddress,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
      );
      const { value } = await connection.getTokenAccountBalance(senderTokenAccount);
      return {
        value: value.amount,
        decimals: value.decimals,
      };
    },
    [connection, publicKey],
  );

  const getSignMessage = useCallback<() => Promise<ISignMessageResult>>(async () => {
    if (!signMessage) throw new Error('No signature method found, please reconnect your wallet');

    const plainText = getAuthPlainText();
    const encoder = new TextEncoder();
    const message = encoder.encode(plainText.plainTextOrigin);
    const res = await signMessage(message);

    return {
      plainTextOrigin: plainText.plainTextOrigin,
      plainTextHex: plainText.plainTextHex,
      signature: AElf.utils.uint8ArrayToHex(res),
      publicKey: stringToHex(publicKey?.toString() || ''),
      sourceType: AuthTokenSource.Solana,
    };
  }, [publicKey, signMessage]);

  const sendTransaction = useCallback(
    async ({ tokenContractAddress, toAddress, amount, decimals }: SendSolanaTransactionParams) => {
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
          amountFormat, // amount
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

  const onConnect = useCallback(
    async (walletName: WalletName) => {
      select(walletName);
      // await connect();
    },
    [select],
  );

  const solanaContext = useMemo(() => {
    return {
      isConnecting: connecting,
      isConnected: connected,
      walletType: WalletTypeEnum.SOL,
      account: publicKey?.toString(),
      accounts: [publicKey?.toString()],
      connector: wallet?.adapter,
      connect: onConnect,
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
    onConnect,
    publicKey,
    sendTransaction,
    wallet?.adapter,
  ]);

  return solanaContext;
}
