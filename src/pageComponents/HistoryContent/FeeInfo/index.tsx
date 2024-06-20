import { TFeeInfoType } from 'types/records';
import styles from './styles.module.scss';
import { TRecordsStatus } from 'types/records';
import { useCommonState } from 'store/Provider/hooks';
import clsx from 'clsx';
import { BusinessType } from 'types/api';
import { defaultNullValue } from 'constants/index';
import { formatSymbolDisplay } from 'utils/format';

type TFeeInfoProps = {
  feeInfo: TFeeInfoType[];
  status: string;
  orderType: BusinessType;
};

export default function FeeInfo({ feeInfo, status, orderType }: TFeeInfoProps) {
  const { isPadPX } = useCommonState();

  if (status === TRecordsStatus.Failed) {
    return <div className={styles['fee-info-wrapper']}>{defaultNullValue}</div>;
  }

  if (orderType === BusinessType.Deposit) {
    return <div className={styles['fee-info-wrapper']}>Free</div>;
  }

  return (
    <div
      className={clsx(
        styles['fee-info-wrapper'],
        isPadPX ? styles['mobile-fee-info-wrapper'] : styles['web-fee-info-wrapper'],
      )}>
      {feeInfo.map((item, index) => {
        return (
          <span className={styles['fee-info-item-wrapper']} key={item.symbol}>
            {index !== 0 && <span className={styles['fee-info-item-add']}>+</span>}
            <span> {item.amount} </span>
            <span> {formatSymbolDisplay(item.symbol)} </span>
          </span>
        );
      })}
    </div>
  );
}
