import { NextLineIcon } from 'assets/images';
import styles from './styles.module.scss';
import { getOmittedStr } from 'utils/calculate';
import { useCallback } from 'react';
import { getAelfExploreLink, getOtherExploreLink, openWithBlank } from 'utils/common';
import {
  AelfExploreType,
  BlockchainNetworkType,
  ExploreUrlType,
  OtherExploreType,
} from 'constants/network';
import { SupportedELFChainId } from 'constants/index';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';

export type TTxHashBoxProps = {
  txHashLabel?: string;
  chainId: SupportedELFChainId;
  network: string;
  txHash: string;
  orderStatus: string;
  isShowIcon?: boolean;
};

export default function TxHashBox({
  txHashLabel,
  chainId,
  network,
  txHash,
  orderStatus,
  isShowIcon = true,
}: TTxHashBoxProps) {
  const { isMobilePX } = useCommonState();
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

  return (
    <div className="flex-row-center" onClick={viewTxDetail}>
      {isShowIcon && <NextLineIcon />}
      {txHashLabel && (
        <span
          className={clsx(
            styles['label'],
            isMobilePX ? styles['mobile-font'] : styles['web-font'],
          )}>
          {txHashLabel}
        </span>
      )}
      {txHash ? (
        <span
          className={clsx(
            styles['value'],
            isMobilePX ? styles['mobile-font'] : styles['web-font'],
          )}>
          {getOmittedStr(txHash, 6, 6)}
        </span>
      ) : (
        <span className={styles['null-value']}>{orderStatus.toLocaleLowerCase()}</span>
      )}
    </div>
  );
}
