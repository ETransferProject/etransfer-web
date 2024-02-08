import React, { useState } from 'react';
import { Dropdown, DropdownProps, MenuProps } from 'antd';
import DownIcon from 'assets/images/down.svg';
import clsx from 'clsx';
import styles from './styles.module.scss';

interface CommonDropdownProps extends DropdownProps {
  handleMenuClick?: (...args: Parameters<Required<MenuProps>['onClick']>) => void;
  /** use 'handleMenuClick' instead of 'onClick' */
  menu?: Omit<MenuProps, 'onClick'>;
}

export default function CommonDropdown({
  handleMenuClick,
  children,
  ...props
}: CommonDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dropdown
      trigger={['click']}
      {...props}
      menu={{
        ...props.menu,
        onClick: (params) => {
          setIsOpen(false);
          handleMenuClick?.(params);
        },
      }}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}>
      <div className={clsx('cursor-pointer', 'flex-row-center', styles['children-container'])}>
        {children}
        <DownIcon
          className={clsx('flex-none', styles['children-icon'], {
            [styles['children-icon-rotate']]: isOpen,
          })}
        />
      </div>
    </Dropdown>
  );
}
