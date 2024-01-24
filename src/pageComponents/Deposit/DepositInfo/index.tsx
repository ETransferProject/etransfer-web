import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { CONTRACT_ADDRESS, MINIMUM_DEPOSIT } from 'constants/deposit';
import { useCommonState, useTokenState } from 'store/Provider/hooks';
import { QuestionMarkIcon } from 'assets/images';
import { formatStr2Ellipsis } from 'utils/format';
import ViewContractAddressModal from 'pageComponents/Modal/ViewContractAddressModal';
import { openWithBlank } from 'utils/common';

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
  const { isMobilePX } = useCommonState();
  const { currentSymbol } = useTokenState();
  const [openAddressModal, setOpenAddressModal] = useState(false);

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
                <span className={clsx('flex', styles.addressEllipsis)}>
                  <span className="text-underline-none">
                    {formatStr2Ellipsis(contractAddress, [6, 6])}
                  </span>
                  <QuestionMarkIcon />
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      <ViewContractAddressModal
        open={openAddressModal}
        value={contractAddress}
        link={contractAddressLink}
        onOk={() => setOpenAddressModal(false)}
      />
    </div>
  );
}
