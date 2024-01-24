import React, { useCallback, useEffect, useState } from 'react';
import WebSelectChain from './WebSelectChain';
import MobileSelectChain from './MobileSelectChain';
import { CHAIN_LIST } from 'constants/index';
import { useCommonState, usePortkeyWalletState } from 'store/Provider/hooks';
import { setCurrentChainItem } from 'store/reducers/common/slice';
import { store } from 'store/Provider/store';
import { CommonSelectChainProps, SelectChainProps } from './types';
import SynchronizingChainModal from 'pageComponents/Modal/SynchronizingChainModal';

export default function SelectChain({ title, clickCallback }: SelectChainProps) {
  const { isMobilePX, currentChainItem } = useCommonState();
  const { accounts } = usePortkeyWalletState();
  const [openSynchronizingModal, setOpenSynchronizingModal] = useState(false);

  const closeSynchronizingModal = useCallback(() => {
    setOpenSynchronizingModal(false);
  }, []);

  useEffect(() => {
    // Default: first one
    // The first one is empty, show the second one
    if (!accounts?.[CHAIN_LIST[0].key]?.[0]) {
      store.dispatch(setCurrentChainItem(CHAIN_LIST[1]));
    }
    if (accounts?.[CHAIN_LIST[0].key]?.[0] && !currentChainItem) {
      store.dispatch(setCurrentChainItem(CHAIN_LIST[0]));
    }
  }, [accounts, currentChainItem]);

  const dropdownProps: CommonSelectChainProps = {
    menuItems: CHAIN_LIST,
    selectedItem: currentChainItem,
    onClick: async (item) => {
      if (accounts?.[item.key]?.[0]) {
        store.dispatch(setCurrentChainItem(item));
        await clickCallback(item);
      } else {
        setOpenSynchronizingModal(true);
      }
    },
  };

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
