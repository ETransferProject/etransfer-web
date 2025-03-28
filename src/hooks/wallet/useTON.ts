import {
  useTonWallet,
  useTonConnectUI,
  SendTransactionRequest,
  CHAIN,
  Wallet,
  TonConnectError,
} from '@tonconnect/ui-react';
import {
  IGetBalanceRequest,
  IGetBalanceResult,
  TSignMessageMethod,
  WalletTypeEnum,
} from 'context/Wallet/types';
import { useCallback, useEffect, useMemo } from 'react';
import TonWeb from 'tonweb';
import { Address as CoreAddress, beginCell, toNano } from '@ton/core';
import { sign, mnemonicToPrivateKey } from '@ton/crypto';
import { getAuthPlainText } from 'utils/auth';
import { getJettonWalletAddress, tonWeb } from 'utils/wallet/TON';
import { AuthTokenSource } from 'types/api';
import { SendTONTransactionParams } from 'types/wallet';
import { stringToHex } from 'utils/format';
import { timesDecimals } from 'utils/calculate';
import myEvents from 'utils/myEvent';

export default function useTON() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const address = useMemo(() => wallet?.account.address || '', [wallet?.account.address]);
  const userFriendlyAddress = useMemo(() => {
    if (!address) return '';
    const res = new TonWeb.utils.Address(address).toString(true, true, false);
    return res;
  }, [address]);

  const onGetBalance = useCallback(
    async ({ tokenContractAddress }: IGetBalanceRequest): Promise<IGetBalanceResult> => {
      if (!address) return { value: '0' };

      const jettonWalletAddress = await getJettonWalletAddress(address, tokenContractAddress);

      const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonWeb.provider, {
        address: jettonWalletAddress,
      });

      const res = await jettonWallet.getData();
      return {
        value: res.balance.toString(),
        decimals: '',
      };
    },
    [address],
  );

  const signMessageByMnemonic = useCallback(
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
        signature: res.toString('hex'),
        publicKey: stringToHex(userFriendlyAddress || ''),
        sourceType: AuthTokenSource.TON,
      };
    },
    [userFriendlyAddress],
  );

  const signMessage = useCallback<TSignMessageMethod>(async () => {
    const plainText = getAuthPlainText();
    return {
      plainTextOrigin: plainText.plainTextOrigin,
      plainTextHex: plainText.plainTextHex,
      signature: plainText.plainTextHex,
      publicKey: stringToHex(userFriendlyAddress || ''),
      sourceType: AuthTokenSource.TON,
    };
  }, [userFriendlyAddress]);

  const sendTransaction = useCallback(
    async ({
      tokenContractAddress,
      toAddress,
      amount,
      decimals,
      orderId,
      forwardTonAmount = '0.01',
    }: SendTONTransactionParams) => {
      if (!address) return;

      const jettonWalletAddress = await getJettonWalletAddress(address, tokenContractAddress);

      const payload = beginCell()
        .storeUint(0xf8a7ea5, 32) // op transfer
        .storeUint(0, 64) // queryId
        .storeCoins(timesDecimals(amount, decimals).toNumber()) // transaction amount
        .storeAddress(CoreAddress.parse(toAddress)) // receiver address
        .storeAddress(CoreAddress.parse(address)) // TON wallet destination address response excess destination
        .storeUint(0, 1) // custom_payload:(Maybe ^Cell)
        .storeCoins(toNano(forwardTonAmount)) // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
        .storeUint(0, 1) // forward_payload:(Either Cell ^Cell)
        .storeMaybeRef(beginCell().storeStringTail(orderId).endCell())
        .endCell();

      const base64Boc = payload.toBoc().toString('base64');
      const transaction: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // 360 sec
        network: CHAIN.MAINNET,
        messages: [
          {
            address: jettonWalletAddress.toString(), // eg: USDT wallet address
            // unit is nanoton. for contract calls, the transaction amount is usually 0
            // for jetton transaction, the amount is the max ton coins fee
            amount: toNano(0.05).toString(),
            payload: base64Boc,
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);

      // translate boc
      const bocCellBytes = await TonWeb.boc.Cell.oneFromBoc(
        TonWeb.utils.base64ToBytes(result.boc),
      ).hash();
      const hashBase64 = TonWeb.utils.bytesToBase64(bocCellBytes);

      return hashBase64;
    },
    [address, tonConnectUI],
  );

  const tonContext = useMemo(() => {
    return {
      isConnected: tonConnectUI.connected,
      walletType: WalletTypeEnum.TON,
      account: userFriendlyAddress,
      accounts: [userFriendlyAddress],
      address,
      connector: tonConnectUI.connector,
      provider: wallet?.provider,
      connect: async (name: string) => {
        await tonConnectUI.openSingleWalletModal(name);
        myEvents.TONConnect.emit();
      },
      disconnect: async () => {
        await tonConnectUI.disconnect();
        myEvents.TONDisconnect.emit();
      },
      getAccountInfo: () => tonConnectUI.account,
      getBalance: onGetBalance,
      signMessage,
      signMessageByMnemonic,
      sendTransaction,
    };
  }, [
    address,
    onGetBalance,
    sendTransaction,
    signMessage,
    signMessageByMnemonic,
    tonConnectUI,
    userFriendlyAddress,
    wallet?.provider,
  ]);

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
