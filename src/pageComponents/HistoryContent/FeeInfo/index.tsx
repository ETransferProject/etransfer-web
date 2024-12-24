import { TFeeInfoType } from 'types/records';
import styles from './styles.module.scss';
import { TOrderStatus } from 'types/records';
import { useCommonState } from 'store/Provider/hooks';
import clsx from 'clsx';
import { BusinessType } from 'types/api';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { formatSymbolDisplay } from 'utils/format';

type TFeeInfoProps = {
  feeInfo: TFeeInfoType[];
  status: string;
  orderType: BusinessType;
};

export default function FeeInfo({ feeInfo, status, orderType }: TFeeInfoProps) {
  const { isPadPX } = useCommonState();

  if (status === TOrderStatus.Failed) {
    return <div className={styles['fee-info-wrapper']}>{DEFAULT_NULL_VALUE}</div>;
  }

  if (orderType === BusinessType.Deposit && Array.isArray(feeInfo) && feeInfo.length === 0) {
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
            {index === 0 ? (
              item.amount ? (
                orderType === BusinessType.Deposit && item.amount === '0' ? (
                  'Free'
                ) : (
                  <>
                    <span> {item.amount} </span>
                    <span> {formatSymbolDisplay(item.symbol)} </span>
                  </>
                )
              ) : (
                DEFAULT_NULL_VALUE
              )
            ) : (
              <>
                <span> {item.amount} </span>
                <span> {formatSymbolDisplay(item.symbol)} </span>
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
