import { NextLineIcon } from 'assets/images';
import styles from './styles.module.scss';
import { getOmittedStr } from 'utils/calculate';
import { useCallback, useMemo } from 'react';
import { getAelfExploreLink, getOtherExploreLink, openWithBlank } from 'utils/common';
import {
  AelfExploreType,
  BlockchainNetworkType,
  ExploreUrlType,
  OtherExploreType,
} from 'constants/network';
import { SupportedELFChainId, defaultNullValue } from 'constants/index';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import { TRecordsStatus, TRecordsStatusI18n } from 'types/records';
import { BusinessType } from 'types/api';

export type TTxHashBoxProps = {
  txHashLabel?: string;
  chainId: SupportedELFChainId;
  network: string;
  txHash: string;
  orderStatus: TRecordsStatus;
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
  const viewTxDetail = useCallback(() => {
    if (network === BlockchainNetworkType.AELF) {
      openWithBlank(getAelfExploreLink(txHash, AelfExploreType.transaction, chainId));
      return;
    }
    openWithBlank(
      getOtherExploreLink(
        txHash,
        OtherExploreType.transaction,
        network as keyof typeof ExploreUrlType,
      ),
    );
  }, [chainId, network, txHash]);

  const txHashSuccess = useMemo(() => {
    return (
      <span
        className={clsx(styles['value'], isPadPX ? styles['mobile-font'] : styles['web-font'])}
        onClick={viewTxDetail}>
        {getOmittedStr(txHash, 6, 6)}
      </span>
    );
  }, [isPadPX, txHash, viewTxDetail]);

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
    return <span className={styles['null-value']}>{defaultNullValue}</span>;
  }, []);

  const renderTxHash = useMemo(() => {
    if (orderStatus === TRecordsStatus.Failed && orderType !== BusinessType.Deposit) {
      return txHashFailed;
    }

    if (orderStatus === TRecordsStatus.Failed && orderType === BusinessType.Deposit) {
      if (type === 'From') {
        return txHash ? txHashSuccess : txHashFailed;
      } else {
        return txHashFailed;
      }
    }

    if (orderStatus === TRecordsStatus.Processing) {
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
