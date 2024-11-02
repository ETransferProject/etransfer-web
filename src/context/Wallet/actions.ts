import { WalletTypeEnum, IWallet } from './types';

export enum WalletActions {
  destroy = 'DESTROY',
}

export type WalletState = {
  fromWallet?: IWallet;
  toWallet?: IWallet;
  fromWalletType?: WalletTypeEnum;
  toWalletType?: WalletTypeEnum;
};
