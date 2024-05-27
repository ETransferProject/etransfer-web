import PartialLoading from 'components/PartialLoading';
import { defaultNullValue } from 'constants/index';
import styles from './styles.module.scss';
import { ZERO } from 'constants/misc';

type TTransactionFee = {
  isTransactionFeeLoading?: boolean;
  isSuccessModalOpen?: boolean;
  transactionFee?: string;
  transactionUnit?: string;
  aelfTransactionFee?: string;
  aelfTransactionUnit?: string;
};

export default function TransactionFee({
  isTransactionFeeLoading = true,
  isSuccessModalOpen = false,
  transactionFee,
  transactionUnit,
  aelfTransactionFee,
  aelfTransactionUnit,
}: TTransactionFee) {
  if (isTransactionFeeLoading) return <PartialLoading />;
  if (aelfTransactionFee && aelfTransactionUnit && transactionUnit === aelfTransactionUnit) {
    return (
      <span className={styles['transaction-fee']}>
        {`${
          !isSuccessModalOpen
            ? ZERO.plus(transactionFee || '0')
                .plus(aelfTransactionFee || '0')
                .toFixed()
            : defaultNullValue
        } ${transactionUnit}`}
      </span>
    );
  }
  if (transactionUnit && aelfTransactionUnit && transactionUnit !== aelfTransactionUnit) {
    return (
      <span className={styles['transaction-fee']}>
        {`${(!isSuccessModalOpen && transactionFee) || defaultNullValue} `}
        <span className={styles['transaction-fee-unit']}>&nbsp;{`${transactionUnit}`}</span>
        &nbsp;
        {`+ ${
          (!isSuccessModalOpen && aelfTransactionFee) || defaultNullValue
        } ${aelfTransactionUnit}`}
      </span>
    );
  }

  return <span>{defaultNullValue}</span>;
}
