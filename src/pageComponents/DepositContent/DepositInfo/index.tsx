import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { CONTRACT_ADDRESS, MINIMUM_DEPOSIT, SERVICE_FEE, SERVICE_FEE_TIP } from 'constants/deposit';
import { useCommonState, useDepositState } from 'store/Provider/hooks';
import { QuestionMark16, QuestionMarkIcon } from 'assets/images';
import { formatStr2Ellipsis, formatSymbolDisplay } from 'utils/format';
import ViewContractAddressModal from 'components/Modal/ViewContractAddressModal';
import { openWithBlank } from 'utils/common';
import { valueFixed2LessThanMin } from 'utils/calculate';
import { CommonModalProps } from 'components/CommonModal';
import CommonTip from 'components/CommonTip';
import { NOTICE } from 'constants/misc';

export interface DepositInfoProps {
  networkName?: string;
  minimumDeposit: string;
  contractAddress: string;
  contractAddressLink: string;
  minAmountUsd: string;
  serviceFee: string;
  serviceFeeUsd: string;
  modalContainer?: CommonModalProps['getContainer'];
}

export default function DepositInfo({
  networkName,
  minimumDeposit,
  contractAddress,
  contractAddressLink,
  minAmountUsd,
  serviceFee,
  serviceFeeUsd,
  modalContainer,
}: DepositInfoProps) {
  const { isPadPX } = useCommonState();
  const { fromTokenSymbol } = useDepositState();
  const [openAddressModal, setOpenAddressModal] = useState(false);

  return (
    <div className={'flex-column'}>
      {!!serviceFee && (
        <div className={clsx('flex', styles['info-line'])}>
          <div className={clsx('flex-row-center gap-4', styles['info-title'])}>
            {SERVICE_FEE}
            <CommonTip
              tip={SERVICE_FEE_TIP}
              className={styles['service-fee-tip']}
              modalTitle={NOTICE}
              icon={<QuestionMark16 />}
            />
          </div>
          <div className={clsx('flex-1')}>
            <div className={clsx('text-right', styles['info-value'])}>
              {serviceFee} {formatSymbolDisplay(fromTokenSymbol)}
            </div>
            <div className={clsx('text-right', styles['info-exhibit'])}>
              {valueFixed2LessThanMin(serviceFeeUsd, '$ ')}
            </div>
          </div>
        </div>
      )}
      {!!minimumDeposit && (
        <div className={clsx('flex', styles['info-line'])}>
          <div className={clsx('flex-none', styles['info-title'])}>{MINIMUM_DEPOSIT}</div>
          <div className={clsx('flex-1')}>
            <div className={clsx('text-right', styles['info-value'])}>
              {minimumDeposit} {formatSymbolDisplay(fromTokenSymbol)}
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
            {!isPadPX && (
              <span
                className={clsx('text-right', styles['info-value'], {
                  'text-link': !!contractAddressLink,
                })}
                onClick={() => openWithBlank(contractAddressLink)}>
                {contractAddress || '-'}
              </span>
            )}
            {isPadPX && (
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
        getContainer={modalContainer}
        network={networkName || ''}
        value={contractAddress}
        link={contractAddressLink}
        onOk={() => setOpenAddressModal(false)}
      />
    </div>
  );
}
