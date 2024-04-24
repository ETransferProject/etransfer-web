import { feeInfoType } from 'types/records';
import styles from './styles.module.scss';
import { RecordsStatus } from 'types/records';
import { useCommonState } from 'store/Provider/hooks';
import clsx from 'clsx';
import { BusinessType } from 'types/api';
import { defaultNullValue } from 'constants/index';

type TFeeInfoProps = {
  feeInfo: feeInfoType[];
  status: string;
  orderType: string;
};

export default function FeeInfo({ feeInfo, status, orderType }: TFeeInfoProps) {
  const { isMobilePX } = useCommonState();

  if (status === RecordsStatus.Failed || orderType === BusinessType.Deposit) {
    return <div className={styles['fee-info-wrapper']}>{defaultNullValue}</div>;
  }

  return (
    <div
      className={clsx(
        styles['fee-info-wrapper'],
        isMobilePX ? styles['mobile-fee-info-wrapper'] : styles['web-fee-info-wrapper'],
      )}>
      {feeInfo.map((item, index) => {
        return (
          <span className={styles['fee-info-item-wrapper']} key={item.symbol}>
            {index !== 0 && <span className={styles['fee-info-item-add']}>+</span>}
            <span> {item.amount} </span>
            <span> {item.symbol} </span>
          </span>
        );
      })}
    </div>
  );
}
