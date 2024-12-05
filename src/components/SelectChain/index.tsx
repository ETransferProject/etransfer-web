import React, { useCallback, useMemo, useState } from 'react';
import WebSelectChain from './WebSelectChain';
import MobileSelectChain from './MobileSelectChain';
import { IChainNameItem } from 'constants/index';
import { useCommonState } from 'store/Provider/hooks';
import { DeviceSelectChainProps, SelectChainProps } from './types';
import SynchronizingChainModal from 'pageComponents/Modal/SynchronizingChainModal';
import NetworkSelectModal, { TNetwork } from 'components/NetworkSelectModal';

export default function SelectChain({
  className,
  childrenClassName,
  menuItems,
  selectedItem,
  clickCallback,
}: SelectChainProps) {
  const { isPadPX } = useCommonState();

  const [openNetworkSelectModal, setOpenNetworkSelectModal] = useState(false);
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

  const onSelect = async (item: TNetwork) => {
    const chainItem = menuItems.find((i) => i.key === item.network);
    if (chainItem) {
      await onClickChain(chainItem);
    }
  };

  const commonProps: DeviceSelectChainProps = useMemo(() => {
    return {
      className,
      childrenClassName,
      selectedItem,
      isExpand: openNetworkSelectModal,
      onClick: () => setOpenNetworkSelectModal(true),
    };
  }, [className, childrenClassName, selectedItem, openNetworkSelectModal]);

  const networkList = menuItems.map((item) => {
    return {
      network: item.key,
      name: item.label,
    };
  });

  return (
    <>
      {isPadPX ? <MobileSelectChain {...commonProps} /> : <WebSelectChain {...commonProps} />}
      <NetworkSelectModal
        networkList={networkList}
        open={openNetworkSelectModal}
        onSelect={onSelect}
        onClose={() => setOpenNetworkSelectModal(false)}
      />
      <SynchronizingChainModal
        open={openSynchronizingModal}
        onOk={closeSynchronizingModal}
        onCancel={closeSynchronizingModal}
      />
    </>
  );
}
