import { useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  IGetBalanceRequest,
  IGetBalanceResult,
  TSignMessageMethod,
  WalletTypeEnum,
} from 'context/Wallet/types';
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
import { sleep, timesDecimals, ZERO } from '@etransfer/utils';
import AElf from 'aelf-sdk';
import { AuthTokenSource } from 'types/api';
import { SendSolanaTransactionParams } from 'types/wallet';
import { stringToHex } from 'utils/format';
import { SOLANA_STORAGE_CONNECTED_KEY } from 'constants/wallet/Solana';
import { devices } from '@portkey/utils';

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
    wallets,
  } = useWallet();

  const onConnect = useCallback(
    async (walletName: string) => {
      const _wallet = wallets.find((item) => item.adapter.name === walletName);
      if (!_wallet) return;
      select(_wallet.adapter.name);

      const isMobile = devices.isMobileDevices();
      if (isMobile) {
        await sleep(3000);
        // await disconnect();
        localStorage?.removeItem(SOLANA_STORAGE_CONNECTED_KEY);
        window.location.reload();
      }
    },
    [select, wallets],
  );

  const onGetBalance = useCallback(
    async ({ tokenContractAddress }: IGetBalanceRequest): Promise<IGetBalanceResult> => {
      if (!publicKey) return { value: '0' };
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

  const getSignMessage = useCallback<TSignMessageMethod>(async () => {
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

  const solanaContext = useMemo(() => {
    return {
      isConnecting: connecting,
      isConnected: connected,
      walletType: WalletTypeEnum.SOL,
      account: publicKey?.toString(),
      accounts: publicKey?.toString() ? [publicKey?.toString()] : [],
      connector: wallet?.adapter,
      connect: onConnect,
      disconnect: disconnect,
      getAccountInfo: connection.getAccountInfo,
      getBalance: onGetBalance,
      signMessage: getSignMessage,
      sendTransaction,
    };
  }, [
    connected,
    connecting,
    connection.getAccountInfo,
    disconnect,
    getSignMessage,
    onConnect,
    onGetBalance,
    publicKey,
    sendTransaction,
    wallet?.adapter,
  ]);

  return solanaContext;
}
