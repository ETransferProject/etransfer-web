import React, { useEffect } from 'react';
import WebSelectChain from './WebSelectChain';
import MobileSelectChain from './MobileSelectChain';
import { CHAIN_LIST } from 'constants/index';
import { useCommonState } from 'store/Provider/hooks';
import { setCurrentChainItem } from 'store/reducers/common/slice';
import { store } from 'store/Provider/store';
import { CommonSelectChainProps, SelectChainProps } from './types';

export default function SelectChain({ clickCallback }: SelectChainProps) {
  const { isMobilePX, currentChainItem } = useCommonState();
  useEffect(() => {
    if (!currentChainItem) {
      store.dispatch(setCurrentChainItem(CHAIN_LIST[0]));
    }
  }, [currentChainItem]);
  const dropdownProps: CommonSelectChainProps = {
    menuItems: CHAIN_LIST,
    selectedItem: currentChainItem,
    onClick: async (item) => {
      store.dispatch(setCurrentChainItem(item));
      await clickCallback(item);
    },
  };
  return isMobilePX ? (
    <MobileSelectChain {...dropdownProps} />
  ) : (
    <WebSelectChain {...dropdownProps} />
  );
}
