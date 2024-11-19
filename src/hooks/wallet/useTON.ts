import {
  useTonWallet,
  useTonConnectUI,
  SendTransactionRequest,
  CHAIN,
  Wallet,
  TonConnectError,
} from '@tonconnect/ui-react';
import { WalletTypeEnum } from 'context/Wallet/types';
import { useCallback, useEffect, useMemo } from 'react';
import TonWeb from 'tonweb';
import { Address as CoreAddress, beginCell, toNano } from '@ton/core';
import { sign, mnemonicToPrivateKey } from '@ton/crypto';
import { getAuthPlainText } from 'utils/auth';
import { getTONJettonMinter, tonWeb } from 'utils/wallet/TON';
import { AuthTokenSource } from 'types/api';

export default function useTON() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const address = useMemo(() => wallet?.account.address, [wallet?.account.address]);

  const getBalance = useCallback(
    async ({ tokenContractAddress }: { tokenContractAddress: string }) => {
      if (!address) return;
      const jettonMinter = getTONJettonMinter(tokenContractAddress);
      const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(
        new TonWeb.utils.Address(address),
      );
      const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonWeb.provider, {
        address: jettonWalletAddress,
      });
      const res = await jettonWallet.getData();
      console.log('>>>>>> TON getBalance res', res, res.balance.toString());
      return {
        value: res.balance.toString(),
        decimals: 6, // TODO
      };
      // const tonBalance = await tonWeb.getBalance(
      //   new TonWeb.utils.Address(address),
      // );
      // console.log('>>>>>> TON get ton balance', fromNano(tonBalance));
    },
    [address],
  );

  const signMessage = useCallback(
    async (mnemonic: string[]) => {
      const plainText = getAuthPlainText();
      const message = Buffer.from(plainText.plainTextOrigin);
      const keyPair = await mnemonicToPrivateKey(mnemonic);

      const secretKey = keyPair.secretKey;
      const res = sign(message, secretKey);

      console.log('>>>>>> TON SignMessage res', res);

      return {
        plainTextOrigin: plainText.plainTextOrigin,
        plainTextHex: plainText.plainTextHex,
        signature: res,
        publicKey: address,
        sourceType: AuthTokenSource.TON,
      };
    },
    [address],
  );

  const sendTransaction = useCallback(
    async ({
      tokenContractAddress,
      toAddress,
      amount,
      forwardTonAmount = '0.00000001',
    }: {
      tokenContractAddress: string;
      toAddress: string;
      amount: number;
      forwardTonAmount?: string;
    }) => {
      if (!address) return;
      const jettonMinter = getTONJettonMinter(tokenContractAddress);
      const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(
        new TonWeb.utils.Address(address),
      );
      const payload = beginCell()
        .storeUint(0xf8a7ea5, 32) // op transfer
        .storeUint(0, 64) // queryId
        .storeCoins(toNano(0.00002)) // transaction amount, 1 USDT = 10^9
        .storeAddress(CoreAddress.parse(toAddress)) // receiver address
        .storeAddress(CoreAddress.parse(address)) // TON wallet destination address response excess destination
        .storeUint(0, 1) // custom_payload:(Maybe ^Cell)
        .storeCoins(toNano(forwardTonAmount)) // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
        .storeUint(0, 1) // forward_payload:(Either Cell ^Cell)
        .endCell();
      // .storeMaybeRef(null) // custom_payload
      // .storeCoins(toNano(forwardTonAmount)) // forward_ton_amount
      // .storeMaybeRef(beginCell().storeStringTail('').endCell()) // forward_payload_amount if receiver is a smart contract
      // .endCell();

      const base64Boc = payload.toBoc().toString('base64');
      const transaction: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // 360 sec
        network: CHAIN.MAINNET, // TODO
        // from: address,
        messages: [
          {
            address: jettonWalletAddress.toString(), // eg: USDT wallet address
            // unit is nanoton. for contract calls, the transaction amount is usually 0
            // for jetton transaction, the amount is the max ton coins fee
            amount: toNano(amount).toString(),
            payload: base64Boc,
          },
        ],
      };

      const res = await tonConnectUI.sendTransaction(transaction);

      return res;
    },
    [address, tonConnectUI],
  );

  const tonContext = useMemo(() => {
    return {
      isConnected: tonConnectUI.connected,
      walletType: WalletTypeEnum.TON,
      account: address,
      accounts: [address],
      connector: tonConnectUI.connector,
      provider: wallet?.provider,
      connect: async (name: string) => await tonConnectUI.openSingleWalletModal(name),
      disconnect: tonConnectUI.disconnect,
      getAccountInfo: () => tonConnectUI.account,
      getBalance,
      signMessage,
      sendTransaction,
    };
  }, [address, getBalance, sendTransaction, signMessage, tonConnectUI, wallet?.provider]);

  return tonContext;
}

export function useTonWalletConnectionError(callback: (error: TonConnectError) => void) {
  const { connector } = useTON();

  const errorsHandler = useCallback(
    (error: TonConnectError) => {
      callback(error);
    },
    [callback],
  );

  const emptyCallback = useCallback((info: Wallet | null) => {
    console.log('>>>>>> TON emptyCallback', info);
  }, []);

  useEffect(
    () => connector.onStatusChange(emptyCallback, errorsHandler),
    [connector, emptyCallback, errorsHandler],
  );
}
