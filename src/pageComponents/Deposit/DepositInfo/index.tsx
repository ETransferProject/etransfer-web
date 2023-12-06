import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { CONTRACT_ADDRESS, MINIMUM_DEPOSIT } from 'constants/deposit';
import { useTokenState } from 'store/Provider/hooks';

export interface DepositInfoProps {
  minimumDeposit: string;
  contractAddress: string;
  contractAddressLink: string;
}

export default function DepositInfo({
  minimumDeposit,
  contractAddress,
  contractAddressLink,
}: DepositInfoProps) {
  const { currentSymbol } = useTokenState();

  return (
    <div className={'flex-column'}>
      {!!minimumDeposit && (
        <div className={clsx('flex', styles['info-line'])}>
          <div className={clsx('flex-none', styles['info-title'])}>{MINIMUM_DEPOSIT}</div>
          <div className={clsx('flex-1', 'text-right', styles['info-value'])}>
            {minimumDeposit} {currentSymbol}
          </div>
        </div>
      )}
      {!!contractAddress && (
        <div className={clsx('flex', styles['info-line'])}>
          <div className={clsx('flex-none', styles['info-title'])}>{CONTRACT_ADDRESS}</div>
          <div className={clsx('flex-1', 'flex-row-content-end')}>
            <span
              className={clsx('text-right', styles['info-value'], {
                'text-link': !!contractAddressLink,
              })}
              onClick={() => {
                if (contractAddressLink) {
                  window?.open(contractAddressLink, '_blank');
                }
              }}>
              {contractAddress || '-'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
