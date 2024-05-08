import React, { useState } from 'react';
import { Dropdown, DropdownProps, MenuProps } from 'antd';
import DownIcon from 'assets/images/down.svg';
import clsx from 'clsx';
import styles from './styles.module.scss';

interface CommonDropdownProps extends DropdownProps {
  childrenClassName?: string;
  isBorder?: boolean;
  /** use 'handleMenuClick' instead of 'onClick' */
  menu?: Omit<MenuProps, 'onClick'>;
  hideDownArrow?: boolean;
  suffix?: React.ReactNode;
  handleMenuClick?: (...args: Parameters<Required<MenuProps>['onClick']>) => void;
}

export default function CommonDropdown({
  isBorder = true,
  childrenClassName,
  handleMenuClick,
  children,
  suffix,
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
      <div
        className={clsx(
          'cursor-pointer',
          'flex-row-center',
          styles['children-container'],
          isBorder && styles['children-container-border'],
          childrenClassName,
        )}>
        {children}
        {!props.hideDownArrow && (
          <DownIcon
            className={clsx('flex-none', styles['children-icon'], {
              [styles['children-icon-rotate']]: isOpen,
            })}
          />
        )}
        {suffix}
      </div>
    </Dropdown>
  );
}
