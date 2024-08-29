import { NextLineIcon } from 'assets/images';
import styles from './styles.module.scss';
import { getOmittedStr } from 'utils/calculate';
import { useMemo } from 'react';
import { viewTxDetailInExplore } from 'utils/common';
import { SupportedELFChainId, DEFAULT_NULL_VALUE } from 'constants/index';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import { TOrderStatus, TRecordsStatusI18n } from 'types/records';
import { BusinessType } from 'types/api';

export type TTxHashBoxProps = {
  txHashLabel?: string;
  chainId: SupportedELFChainId;
  network: string;
  txHash: string;
  orderStatus: TOrderStatus;
  orderType: BusinessType;
  type: 'From' | 'To';
  isShowIcon?: boolean;
};

export default function TxHashBox({
  txHashLabel,
  chainId,
  network,
  txHash,
  orderStatus,
  orderType,
  type,
  isShowIcon = true,
}: TTxHashBoxProps) {
  const { isPadPX } = useCommonState();

  const txHashSuccess = useMemo(() => {
    return (
      <span
        className={clsx(styles['value'], isPadPX ? styles['mobile-font'] : styles['web-font'])}
        onClick={(event: any) => {
          event.stopPropagation();
          viewTxDetailInExplore(network, txHash, chainId);
        }}>
        {getOmittedStr(txHash, 6, 6)}
      </span>
    );
  }, [chainId, isPadPX, network, txHash]);

  const txHashPending = useMemo(() => {
    return (
      <span className={styles['null-value']}>
        {TRecordsStatusI18n.Processing.toLocaleLowerCase()}
      </span>
    );
  }, []);

  const txHashFailed = useMemo(() => {
    return (
      <span className={styles['null-value']}>{TRecordsStatusI18n.Failed.toLocaleLowerCase()}</span>
    );
  }, []);

  const txHashNull = useMemo(() => {
    return <span className={styles['null-value']}>{DEFAULT_NULL_VALUE}</span>;
  }, []);

  const renderTxHash = useMemo(() => {
    if (orderStatus === TOrderStatus.Failed && orderType !== BusinessType.Deposit) {
      return txHashFailed;
    }

    if (orderStatus === TOrderStatus.Failed && orderType === BusinessType.Deposit) {
      if (type === 'From') {
        return txHash ? txHashSuccess : txHashFailed;
      } else {
        return txHashFailed;
      }
    }

    if (orderStatus === TOrderStatus.Processing) {
      return txHash ? txHashSuccess : txHashPending;
    }

    // TRecordsStatusI18n.Succeed
    return txHash ? txHashSuccess : txHashNull;
  }, [
    orderStatus,
    orderType,
    txHash,
    txHashFailed,
    txHashNull,
    txHashPending,
    txHashSuccess,
    type,
  ]);

  return (
    <div className="flex-row-center">
      {isShowIcon && <NextLineIcon />}
      {txHashLabel && (
        <span
          className={clsx(styles['label'], isPadPX ? styles['mobile-font'] : styles['web-font'])}>
          {txHashLabel}
        </span>
      )}
      {renderTxHash}
    </div>
  );
}
