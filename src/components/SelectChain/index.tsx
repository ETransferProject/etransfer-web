import React, { useCallback, useMemo, useState } from 'react';
import WebSelectChain from './WebSelectChain';
import MobileSelectChain from './MobileSelectChain';
import { IChainNameItem } from 'constants/index';
import { useCommonState } from 'store/Provider/hooks';
import { DeviceSelectChainProps, SelectChainProps } from './types';
import SynchronizingChainModal from 'pageComponents/Modal/SynchronizingChainModal';

export default function SelectChain({
  title,
  className,
  childrenClassName,
  isBorder,
  suffixArrowSize,
  hideDownArrow,
  menuItems,
  selectedItem,
  clickCallback,
}: SelectChainProps) {
  const { isMobilePX } = useCommonState();

  const [openSynchronizingModal, setOpenSynchronizingModal] = useState(false);

  const closeSynchronizingModal = useCallback(() => {
    setOpenSynchronizingModal(false);
  }, []);

  const onClickChain = useCallback(
    async (item: IChainNameItem) => {
      if (item.key === selectedItem.key) return;
      await clickCallback(item);
      // setOpenSynchronizingModal((pre) => {
      //   return !pre;
      // });
    },
    [clickCallback, selectedItem.key],
  );
  const dropdownProps: DeviceSelectChainProps = useMemo(() => {
    return {
      menuItems,
      selectedItem,
      onClick: onClickChain,
    };
  }, [menuItems, onClickChain, selectedItem]);

  return (
    <>
      {isMobilePX ? (
        <MobileSelectChain
          {...dropdownProps}
          title={title}
          className={className}
          childrenClassName={childrenClassName}
          isBorder={isBorder}
        />
      ) : (
        <WebSelectChain
          {...dropdownProps}
          className={className}
          childrenClassName={childrenClassName}
          isBorder={isBorder}
          suffixArrowSize={suffixArrowSize}
          hideDownArrow={hideDownArrow}
        />
      )}
      <SynchronizingChainModal
        open={openSynchronizingModal}
        onOk={closeSynchronizingModal}
        onCancel={closeSynchronizingModal}
      />
    </>
  );
}
