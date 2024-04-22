import { feeInfoType } from 'types/records';
import styles from './styles.module.scss';
import { RecordsStatus } from 'types/records';
import { useCommonState } from 'store/Provider/hooks';
import clsx from 'clsx';

interface FeeInfoProps {
  feeInfo: feeInfoType[];
  status: string;
  orderType: string;
}

export default function FeeInfo({ feeInfo, status, orderType }: FeeInfoProps) {
  const { isMobilePX } = useCommonState();

  if (status === RecordsStatus.Failed || orderType === 'Deposit') {
    return <div className={styles['feeInfo-wrapper']}>--</div>;
  }

  return (
    <div
      className={clsx(
        styles['feeInfo-wrapper'],
        isMobilePX ? styles['mobile-feeInfo-wrapper'] : styles['web-feeInfo-wrapper'],
      )}>
      {feeInfo.map((item, index) => {
        return (
          <span className={styles['feeInfo-item-wrapper']} key={item.symbol}>
            {index !== 0 && <span className={styles['feeInfo-item-add']}>+</span>}
            <span> {item.amount} </span>
            <span> {item.symbol} </span>
          </span>
        );
      })}
    </div>
  );
}
