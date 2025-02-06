import PartialLoading from 'components/PartialLoading';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import styles from './styles.module.scss';
import { useMemo } from 'react';
import clsx from 'clsx';
import CommonSpace from 'components/CommonSpace';

type TFeeInfo = {
  isTransactionFeeLoading?: boolean;
  isSuccessModalOpen?: boolean;
  transactionFee?: string;
  transactionUnit?: string;
  aelfTransactionFee?: string;
  aelfTransactionUnit?: string;
};

export default function FeeInfo({
  isTransactionFeeLoading = true,
  isSuccessModalOpen = false,
  transactionFee,
  transactionUnit,
  aelfTransactionFee,
  aelfTransactionUnit,
}: TFeeInfo) {
  const estimatedGasFeeElement = useMemo(() => {
    return (
      <span className={clsx('flex-row-center', styles['fee-item'])}>
        <span className={styles['fee-label']}>Estimated Gas Fee:</span>
        {isTransactionFeeLoading && <PartialLoading />}
        {!isTransactionFeeLoading && (
          <>
            {aelfTransactionFee && aelfTransactionUnit ? (
              <>
                <span className={styles['fee-value']}>
                  {`${(!isSuccessModalOpen && aelfTransactionFee) || DEFAULT_NULL_VALUE}`}
                </span>
                <span className={styles['fee-unit']}>&nbsp;{`${aelfTransactionUnit}`}</span>
              </>
            ) : (
              <>
                <span className={styles['fee-value']}>{DEFAULT_NULL_VALUE}</span>
              </>
            )}
          </>
        )}
      </span>
    );
  }, [aelfTransactionFee, aelfTransactionUnit, isSuccessModalOpen, isTransactionFeeLoading]);

  const transactionFeeElement = useMemo(() => {
    return (
      <span className={clsx('flex-row-center', styles['fee-item'])}>
        <span className={styles['fee-label']}>Transaction Fee:</span>
        {isTransactionFeeLoading && <PartialLoading />}
        {!isTransactionFeeLoading && (
          <>
            {transactionFee && transactionUnit ? (
              <>
                <span className={styles['fee-value']}>
                  {`${(!isSuccessModalOpen && transactionFee) || DEFAULT_NULL_VALUE}`}
                </span>
                <span className={styles['fee-unit']}>&nbsp;{`${transactionUnit}`}</span>
              </>
            ) : (
              <>
                <span className={styles['fee-value']}>{DEFAULT_NULL_VALUE}</span>
              </>
            )}
          </>
        )}
      </span>
    );
  }, [isSuccessModalOpen, isTransactionFeeLoading, transactionFee, transactionUnit]);

  return (
    <div>
      {estimatedGasFeeElement}
      <CommonSpace direction={'vertical'} size={2} />
      {transactionFeeElement}
    </div>
  );
}
