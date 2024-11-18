import { basicActions } from 'context/utils';
import { WalletTypeEnum, IWallet } from './types';

export type WalletState = {
  fromWallet?: IWallet;
  toWallet?: IWallet;
  fromWalletType?: WalletTypeEnum;
  toWalletType?: WalletTypeEnum;
};

export enum WalletActions {
  destroy = 'DESTROY',
  setFromWalletType = 'setFromWalletType',
  setToWalletType = 'setToWalletType',
}

export const walletAction = {
  setFromWalletType: {
    type: WalletActions.setFromWalletType,
    actions: (walletType: WalletTypeEnum) =>
      basicActions(WalletActions.setFromWalletType, { walletType }),
  },
  setToWalletType: {
    type: WalletActions.setToWalletType,
    actions: (walletType: WalletTypeEnum) =>
      basicActions(WalletActions.setToWalletType, { walletType }),
  },

  destroy: {
    type: WalletActions.destroy,
    actions: () => basicActions(WalletActions.destroy),
  },
};
