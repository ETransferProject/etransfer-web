import {
  CHAIN,
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
  SendTransactionRequest,
} from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import TonWeb from 'tonweb';
import { Button } from 'antd';
import { useCallback } from 'react';

// const TON_COBO_ADDRESS = 'UQCiypMj9RGBcg7H7j-JdRhwbUS1ZeK61naDxf5fX4TBUsy6';
const TON_ADDRESS = 'UQCNNZ0MlArFSp43oJFkiL37qifa1yZGf9jMnM41gUU35UZV';
const USDT_CONTRACT_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

const tonweb = new TonWeb();
const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonweb.provider, {
  address: USDT_CONTRACT_ADDRESS,
} as any);

export default function TONWallet() {
  const walletInfo = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const onConnectTON = useCallback(() => {
    tonConnectUI.openSingleWalletModal('tonkeeper');
  }, [tonConnectUI]);
  const onDisConnectTON = useCallback(async () => {
    tonConnectUI.disconnect();
  }, [tonConnectUI]);

  const onSendTransaction = useCallback(async () => {
    try {
      if (!walletInfo?.account.address) return;

      const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(
        new TonWeb.utils.Address(walletInfo?.account.address),
      );
      const payload = beginCell()
        .storeUint(0xf8a7ea5, 32) // op transfer
        .storeUint(0, 64) // queryId
        .storeCoins(toNano(0.00002)) // transaction amount
        .storeAddress(Address.parse(TON_ADDRESS)) // receiver address
        .storeAddress(Address.parse(walletInfo?.account.address)) // TON wallet destination address response excess destination
        .storeUint(0, 1) // custom_payload:(Maybe ^Cell)
        .storeCoins(toNano('0.00000001')) // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
        .storeUint(0, 1) // forward_payload:(Either Cell ^Cell)
        .endCell();
      // .storeMaybeRef(null) // custom_payload
      // .storeCoins(toNano('0.00000001')) // forward_ton_amount
      // .storeMaybeRef(beginCell().storeStringTail('').endCell()) // forward_payload_amount if receiver is a smart contract
      // .endCell();

      const base64Boc = payload.toBoc().toString('base64');
      const transaction: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // 360 sec
        network: CHAIN.MAINNET,
        // from: walletInfo?.account.address,
        messages: [
          {
            address: jettonWalletAddress.toString(), // USDT wallet address
            // unit is nanoton. for contract calls, the transaction amount is usually 0
            // for jetton transaction, the amount is the max ton coins fee
            amount: toNano(0.01).toString(),
            payload: base64Boc,
          },
        ],
      };

      const res = await tonConnectUI.sendTransaction(transaction);
      console.log('>>>>>> TON res', res);
    } catch (error) {
      console.log('>>>>>> TON error', error);
    }
  }, [tonConnectUI, walletInfo?.account.address]);

  return (
    <div>
      <Button onClick={onConnectTON}>Connect TON</Button>
      <TonConnectButton />
      <Button onClick={onDisConnectTON}>DisConnect TON</Button>
      <Button onClick={onSendTransaction}>Send Transaction</Button>
    </div>
  );
}
