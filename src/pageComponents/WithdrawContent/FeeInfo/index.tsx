import PartialLoading from 'components/PartialLoading';
import { defaultNullValue } from 'constants/index';
import styles from './styles.module.scss';
import { useMemo } from 'react';
import clsx from 'clsx';
import Space from 'components/Space';

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
                  {`${(!isSuccessModalOpen && aelfTransactionFee) || defaultNullValue}`}
                </span>
                <span className={styles['fee-unit']}>&nbsp;{`${aelfTransactionUnit}`}</span>
              </>
            ) : (
              <>
                <span className={styles['fee-value']}>{defaultNullValue}</span>
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
                  {`${(!isSuccessModalOpen && transactionFee) || defaultNullValue}`}
                </span>
                <span className={styles['fee-unit']}>&nbsp;{`${transactionUnit}`}</span>
              </>
            ) : (
              <>
                <span className={styles['fee-value']}>{defaultNullValue}</span>
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
      <Space direction={'vertical'} size={2} />
      {transactionFeeElement}
    </div>
  );
}
