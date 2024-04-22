import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { CONTRACT_ADDRESS, MINIMUM_DEPOSIT } from 'constants/deposit';
import { useCommonState } from 'store/Provider/hooks';
import { QuestionMarkIcon } from 'assets/images';
import { formatStr2Ellipsis } from 'utils/format';
import ViewContractAddressModal from 'pageComponents/Modal/ViewContractAddressModal';
import { openWithBlank } from 'utils/common';
import { useDeposit } from 'hooks/deposit';
import { valueFixed2LessThanMin } from 'utils/calculate';

export interface DepositInfoProps {
  networkName?: string;
  minimumDeposit: string;
  contractAddress: string;
  contractAddressLink: string;
  minAmountUsd: string;
}

export default function DepositInfo({
  networkName,
  minimumDeposit,
  contractAddress,
  contractAddressLink,
  minAmountUsd,
}: DepositInfoProps) {
  const { isMobilePX } = useCommonState();
  const { currentSymbol } = useDeposit();
  const [openAddressModal, setOpenAddressModal] = useState(false);

  return (
    <div className={'flex-column'}>
      {!!minimumDeposit && (
        <div className={clsx('flex', styles['info-line'])}>
          <div className={clsx('flex-none', styles['info-title'])}>{MINIMUM_DEPOSIT}</div>
          <div className={clsx('flex-1')}>
            <div className={clsx('text-right', styles['info-value'])}>
              {minimumDeposit} {currentSymbol}
            </div>
            <div className={clsx('text-right', styles['info-exhibit'])}>
              {valueFixed2LessThanMin(minAmountUsd, '$ ')}
            </div>
          </div>
        </div>
      )}
      {!!contractAddress && (
        <div className={clsx('flex', styles['info-line'])}>
          <div className={clsx('flex-none', styles['info-title'])}>{CONTRACT_ADDRESS}</div>
          <div className={clsx('flex-1', 'flex-row-content-end')}>
            {!isMobilePX && (
              <span
                className={clsx('text-right', styles['info-value'], {
                  'text-link': !!contractAddressLink,
                })}
                onClick={() => openWithBlank(contractAddressLink)}>
                {contractAddress || '-'}
              </span>
            )}
            {isMobilePX && (
              <span
                className={clsx('text-right', styles['info-value'])}
                onClick={() => setOpenAddressModal(true)}>
                <span className={clsx('flex-row-center', styles.addressEllipsis)}>
                  <span className="text-underline-none">
                    {formatStr2Ellipsis(contractAddress, [6, 6])}
                  </span>
                  <span className={clsx(styles['question-mark-icon'])}>
                    <QuestionMarkIcon />
                  </span>
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      <ViewContractAddressModal
        open={openAddressModal}
        network={networkName || ''}
        value={contractAddress}
        link={contractAddressLink}
        onOk={() => setOpenAddressModal(false)}
      />
    </div>
  );
}
