import { NextLineIcon } from 'assets/images';
import styles from './styles.module.scss';
import { getOmittedStr } from 'utils/calculate';
import { useCallback } from 'react';
import { getAelfExploreLink, openWithBlank } from 'utils/common';
import { AelfExploreType } from 'constants/network';
import { SupportedELFChainId, defaultNullValue } from 'constants/index';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';

export type TTxHashBoxProps = {
  txHashLabel?: string;
  chainId: SupportedELFChainId;
  txHash: string;
  isShowIcon?: boolean;
};

export type TxHashBoxForEnd = Omit<TTxHashBoxProps, 'chainId'> & {
  viewTxDetail: () => void;
};

export function TxHashBoxForWeb({ txHashLabel, txHash, viewTxDetail }: TxHashBoxForEnd) {
  return (
    <div className="flex-row-center" onClick={viewTxDetail}>
      <NextLineIcon />
      <span className={clsx(styles['web-label'], styles['web-font'])}>{txHashLabel}</span>
      <span className={clsx(styles['web-value'], styles['web-font'])}>
        {getOmittedStr(txHash, 6, 6)}
      </span>
    </div>
  );
}

export function TxHashBoxForMobile({ txHashLabel, txHash, viewTxDetail }: TxHashBoxForEnd) {
  return (
    <div className="flex-row-center-between" onClick={viewTxDetail}>
      <span className={clsx(styles['mobile-label'], styles['mobile-font'])}>{txHashLabel}</span>
      <span className={clsx(styles['mobile-value'], styles['mobile-font'])}>
        {getOmittedStr(txHash, 6, 6)}
      </span>
    </div>
  );
}

export default function TxHashBox({
  txHashLabel,
  chainId,
  txHash,
  isShowIcon = true,
}: TTxHashBoxProps) {
  const { isMobilePX } = useCommonState();
  const viewTxDetail = useCallback(() => {
    openWithBlank(getAelfExploreLink(txHash, AelfExploreType.transaction, chainId));
  }, [chainId, txHash]);

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
        <span className={styles['null-value']}>{defaultNullValue}</span>
      )}
    </div>
  );
}
