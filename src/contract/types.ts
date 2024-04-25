import {
  WalletInfo,
  WalletType,
  WalletHookInterface,
  SignatureParams,
  SignatureData,
  CallContractHookInterface,
  CallContractParams,
} from 'aelf-web-login';
import { ChainId, SendOptions } from '@portkey/types';
import { SendOptions as SendOptionsV1 } from '@portkey-v1/types';

export interface IWebLoginArgs {
  address: string;
  chainId: string;
}

export type TCallViewMethod = CallContractHookInterface['callViewMethod'];
export type TCallSendMethod = CallContractHookInterface['callSendMethod'];
export type CallContractFunc = any; //WalletHookInterface['callContract'];
export type GetSignatureFunc = WalletHookInterface['getSignature'];
export type TSignatureParams = Omit<SignatureParams, 'appName' | 'address'>;

export interface IWallet {
  walletInfo: WalletInfo;
  walletType: WalletType;
  callContract: CallContractFunc;
  getSignature: (params: TSignatureParams) => Promise<SignatureData>;
  setCallContract: (callContract: CallContractFunc) => void;
  setGetSignature: (getSignature: GetSignatureFunc) => void;
  callSendMethod<T, R>(
    chain: ChainId,
    params: CallContractParams<T>,
    sendOptions?: SendOptions | SendOptionsV1,
  ): Promise<R> | undefined;
  callViewMethod<T, R>(chain: ChainId, params: CallContractParams<T>): Promise<R> | undefined;
}

export type IWalletProps = {
  walletInfo: WalletInfo;
  walletType: WalletType;
  callContract: CallContractFunc;
  getSignature: GetSignatureFunc;
};
