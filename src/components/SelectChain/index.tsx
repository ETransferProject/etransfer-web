import React, { useCallback, useEffect, useMemo, useState } from 'react';
import WebSelectChain from './WebSelectChain';
import MobileSelectChain from './MobileSelectChain';
import { CHAIN_LIST, CHAIN_LIST_SIDE_CHAIN, IChainNameItem } from 'constants/index';
import { useCommonState, useUserActionState } from 'store/Provider/hooks';
import { setCurrentChainItem } from 'store/reducers/userAction/slice';
import { store } from 'store/Provider/store';
import { CommonSelectChainProps, SelectChainProps } from './types';
import SynchronizingChainModal from 'pageComponents/Modal/SynchronizingChainModal';
import { useAccounts } from 'hooks/portkeyWallet';
import { useDeposit } from 'hooks/deposit';
import { SideMenuKey } from 'constants/home';
import { useWithdraw } from 'hooks/withdraw';

export default function SelectChain({ title, clickCallback }: SelectChainProps) {
  const { activeMenuKey, isMobilePX } = useCommonState();
  const { deposit, withdraw } = useUserActionState();
  const { currentSymbol, currentChainItem: depositCurrentChainItem } = useDeposit();
  const { currentChainItem: withdrawCurrentChainItem } = useWithdraw();
  const accounts = useAccounts();
  const [openSynchronizingModal, setOpenSynchronizingModal] = useState(false);

  const closeSynchronizingModal = useCallback(() => {
    setOpenSynchronizingModal(false);
  }, []);

  useEffect(() => {
    // Default: first one
    // The first one is empty, show the second one
    if (!accounts?.[CHAIN_LIST[0].key]?.[0]) {
      store.dispatch(setCurrentChainItem({ chainItem: CHAIN_LIST[1] }));
    }
    if (accounts?.[CHAIN_LIST[0].key]?.[0] && !deposit.currentChainItem) {
      store.dispatch(
        setCurrentChainItem({ activeMenuKey: SideMenuKey.Deposit, chainItem: CHAIN_LIST[0] }),
      );
    }
    if (accounts?.[CHAIN_LIST[0].key]?.[0] && !withdraw.currentChainItem) {
      store.dispatch(
        setCurrentChainItem({ activeMenuKey: SideMenuKey.Withdraw, chainItem: CHAIN_LIST[0] }),
      );
    }
  }, [accounts, deposit.currentChainItem, withdraw.currentChainItem]);

  const onClickChain = useCallback(
    async (item: IChainNameItem) => {
      if (accounts?.[item.key]?.[0]) {
        store.dispatch(setCurrentChainItem({ activeMenuKey, chainItem: item }));
        await clickCallback(item);
      } else {
        setOpenSynchronizingModal(true);
      }
    },
    [accounts, activeMenuKey, clickCallback],
  );

  const dropdownProps: CommonSelectChainProps = useMemo(() => {
    if (activeMenuKey === SideMenuKey.Deposit && currentSymbol?.includes('SGR')) {
      onClickChain(CHAIN_LIST_SIDE_CHAIN[0]);
    }

    return {
      menuItems:
        activeMenuKey === SideMenuKey.Deposit && currentSymbol?.includes('SGR')
          ? CHAIN_LIST_SIDE_CHAIN
          : CHAIN_LIST,
      selectedItem:
        activeMenuKey === SideMenuKey.Deposit ? depositCurrentChainItem : withdrawCurrentChainItem,
      onClick: onClickChain,
    };
  }, [
    activeMenuKey,
    currentSymbol,
    depositCurrentChainItem,
    onClickChain,
    withdrawCurrentChainItem,
  ]);

  return (
    <>
      {isMobilePX ? (
        <MobileSelectChain {...dropdownProps} title={title} />
      ) : (
        <WebSelectChain {...dropdownProps} />
      )}
      <SynchronizingChainModal
        open={openSynchronizingModal}
        onOk={closeSynchronizingModal}
        onCancel={closeSynchronizingModal}
      />
    </>
  );
}
