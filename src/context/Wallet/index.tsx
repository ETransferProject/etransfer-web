import { BasicActions } from '../utils';

import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { WalletActions, WalletState } from './actions';
import useEVM from 'hooks/wallet/useEVM';
import useSolana from 'hooks/wallet/useSolana';
import useTON from 'hooks/wallet/useTON';
import useTRON from 'hooks/wallet/useTRON';
import useAelf from 'hooks/wallet/useAelf';
import { WalletTypeEnum } from './types';
import { useCrossChainTransfer } from 'store/Provider/hooks';

const INITIAL_STATE = {};
const WalletContext = createContext<any>(INITIAL_STATE);

export function useWallet(): [WalletState, BasicActions<WalletActions>] {
  return useContext(WalletContext);
}

function reducer(state: WalletState, { type, payload }: { type: WalletActions; payload: any }) {
  switch (type) {
    case WalletActions.destroy: {
      return INITIAL_STATE;
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [WalletState, BasicActions<WalletActions>['dispatch']] = useReducer(
    reducer,
    INITIAL_STATE,
  );
  const { fromWalletType, toWalletType } = useCrossChainTransfer();
  const actions = useMemo(() => ({ dispatch }), [dispatch]);

  const evmWallet = useEVM();
  const solanaWallet = useSolana();
  const tonWallet = useTON();
  const tronWallet = useTRON();
  const aelfWallet = useAelf();

  const WalletAdapter = useMemo(() => {
    return {
      [WalletTypeEnum.EVM]: evmWallet,
      [WalletTypeEnum.SOL]: solanaWallet,
      [WalletTypeEnum.TON]: tonWallet,
      [WalletTypeEnum.TRON]: tronWallet,
      [WalletTypeEnum.AELF]: aelfWallet,
    };
  }, [aelfWallet, evmWallet, solanaWallet, tonWallet, tronWallet]);

  const [fromWallet, toWallet] = useMemo(() => {
    let fromWallet, toWallet;
    if (fromWalletType) fromWallet = WalletAdapter[fromWalletType];
    if (toWalletType) toWallet = WalletAdapter[toWalletType];

    return [fromWallet, toWallet];
  }, [WalletAdapter, fromWalletType, toWalletType]);

  return (
    <WalletContext.Provider
      value={useMemo(
        () => [{ ...state, fromWallet, toWallet }, actions],
        [state, fromWallet, toWallet, actions],
      )}>
      {children}
    </WalletContext.Provider>
  );
}
