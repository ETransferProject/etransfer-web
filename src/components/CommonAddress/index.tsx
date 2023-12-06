import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Copy, { CopySize } from 'components/Copy';

interface CommonAddressProps {
  labelClassName?: string;
  valueClassName?: string;
  valueWrapperClassName?: string;
  label?: string;
  value?: string;
  copySize?: CopySize;
}

export default function CommonAddress({
  labelClassName,
  valueClassName,
  valueWrapperClassName,
  label,
  value,
  copySize,
}: CommonAddressProps) {
  return (
    <div className={clsx('flex-column', styles['address-wrapper'])}>
      <div className={clsx(styles['address-text-title'], labelClassName)}>{label}</div>
      <div className={clsx('flex-row-center', valueWrapperClassName)}>
        <div className={clsx('flex-1', styles['address-text-content'], valueClassName)}>
          {value}
        </div>
        {!!value && <Copy className={'flex-none'} toCopy={value || ''} size={copySize} />}
      </div>
    </div>
  );
}
