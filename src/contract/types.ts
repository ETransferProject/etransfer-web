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

export type TCallViewMethod = CallContractHookInterface['callViewMethod'];
export type TCallSendMethod = CallContractHookInterface['callSendMethod'];
export type TCallContractFunc = any; //WalletHookInterface['callContract'];
export type TGetSignatureFunc = WalletHookInterface['getSignature'];
export type TSignatureParams = Omit<SignatureParams, 'appName' | 'address'>;

export type TWallet = {
  walletInfo: WalletInfo;
  walletType: WalletType;
  callContract: TCallContractFunc;
  getSignature: (params: TSignatureParams) => Promise<SignatureData>;
  setCallContract: (callContract: TCallContractFunc) => void;
  setGetSignature: (getSignature: TGetSignatureFunc) => void;
  callSendMethod<T, R>(
    chain: ChainId,
    params: CallContractParams<T>,
    sendOptions?: SendOptions | SendOptionsV1,
  ): Promise<R> | undefined;
  callViewMethod<T, R>(chain: ChainId, params: CallContractParams<T>): Promise<R> | undefined;
};

export type TWalletProps = {
  walletInfo: WalletInfo;
  walletType: WalletType;
  callContract: TCallContractFunc;
  getSignature: TGetSignatureFunc;
};
