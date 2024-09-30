import React, { useMemo } from 'react';
import CommonDropdown from 'components/CommonDropdown';
import { DeviceSelectChainProps } from '../types';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { AelfBig, tDVVBig as TDVVBig } from 'assets/images';
import { SupportedELFChainId } from 'constants/index';

export default function WebSelectChain({
  className,
  childrenClassName,
  overlayClassName,
  menuItems,
  selectedItem,
  isBorder,
  suffixArrowSize,
  hideDownArrow,
  onClick,
  getContainer,
}: DeviceSelectChainProps) {
  const menuItemsAddIcon = useMemo(() => {
    const list: any[] = [];
    menuItems.forEach((item) => {
      list.push({
        ...item,
        icon: item.key === SupportedELFChainId.AELF ? <AelfBig /> : <TDVVBig />,
      });
    });

    return list;
  }, [menuItems]);

  return (
    <CommonDropdown
      getContainer={getContainer}
      className={className}
      childrenClassName={childrenClassName}
      overlayClassName={clsx(styles['chain-dropdown'], overlayClassName)}
      isBorder={isBorder}
      menu={{
        items: menuItemsAddIcon,
        selectedKeys: [selectedItem?.key],
      }}
      handleMenuClick={(item) => {
        onClick?.(menuItems.find((chain) => chain?.key === item?.key) || menuItems[0]);
      }}
      suffixArrowSize={suffixArrowSize}
      hideDownArrow={hideDownArrow}>
      <div className={styles['trigger-text']}>{selectedItem?.label}</div>
    </CommonDropdown>
  );
}
