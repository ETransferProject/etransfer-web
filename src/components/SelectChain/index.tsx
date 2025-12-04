import React, { useCallback, useMemo, useState } from 'react';
import WebSelectChain from './WebSelectChain';
import MobileSelectChain from './MobileSelectChain';
import { IChainNameItem } from 'constants/index';
import { useCommonState } from 'store/Provider/hooks';
import { DeviceSelectChainProps, SelectChainProps } from './types';
import SynchronizingChainModal from 'components/Modal/SynchronizingChainModal';

export default function SelectChain({
  title,
  className,
  childrenClassName,
  overlayClassName,
  getContainer,
  isBorder,
  suffixArrowSize,
  hideDownArrow,
  menuItems,
  selectedItem,
  clickCallback,
}: SelectChainProps) {
  const { isPadPX } = useCommonState();

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
  const dropdownProps: Omit<DeviceSelectChainProps, 'getContainer'> = useMemo(() => {
    return {
      menuItems,
      selectedItem,
      onClick: onClickChain,
    };
  }, [menuItems, onClickChain, selectedItem]);

  return (
    <>
      {isPadPX ? (
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
          getContainer={getContainer}
          className={className}
          childrenClassName={childrenClassName}
          overlayClassName={overlayClassName}
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
