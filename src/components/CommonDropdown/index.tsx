import React, { useState } from 'react';
import { Dropdown, DropdownProps, MenuProps } from 'antd';
import DynamicArrow, { TDynamicArrowSize } from 'components/DynamicArrow';
import clsx from 'clsx';
import styles from './styles.module.scss';

export interface CommonDropdownProps extends DropdownProps {
  getContainer?: string;
  childrenClassName?: string;
  isBorder?: boolean;
  menu?: Omit<MenuProps, 'onClick'>;
  hideDownArrow?: boolean;
  suffixArrowSize?: TDynamicArrowSize;
  /** use 'handleMenuClick' instead of 'onClick' */
  handleMenuClick?: (...args: Parameters<Required<MenuProps>['onClick']>) => void;
}

export default function CommonDropdown({
  getContainer,
  isBorder = true,
  childrenClassName,
  handleMenuClick,
  children,
  suffixArrowSize,
  ...props
}: CommonDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dropdown
      trigger={['click']}
      {...props}
      getPopupContainer={() => document.getElementById(getContainer as string) as HTMLElement}
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
          <DynamicArrow
            isExpand={isOpen}
            className={styles['children-icon']}
            size={suffixArrowSize}
          />
        )}
      </div>
    </Dropdown>
  );
}
