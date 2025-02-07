import PartialLoading from 'components/PartialLoading';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import styles from './styles.module.scss';
import clsx from 'clsx';

type TFeeInfo = {
  isTransactionFeeLoading?: boolean;
  isSuccessModalOpen?: boolean;
  transactionFee?: string;
  transactionUnit?: string;
};

export default function FeeInfo({
  isTransactionFeeLoading = true,
  isSuccessModalOpen = false,
  transactionFee,
  transactionUnit,
}: TFeeInfo) {
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
}
