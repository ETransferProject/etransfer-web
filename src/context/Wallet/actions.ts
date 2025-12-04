import { basicActions } from 'context/utils';
import { IWallet } from './types';

export type WalletState = {
  fromWallet?: IWallet;
  toWallet?: IWallet;
};

export enum WalletActions {
  destroy = 'DESTROY',
}

export const walletAction = {
  destroy: {
    type: WalletActions.destroy,
    actions: () => basicActions(WalletActions.destroy),
  },
};
