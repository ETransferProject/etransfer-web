import clsx from 'clsx';
import CheckFilledIcon from 'assets/images/checkFilled.svg';
import CommonModalSwitchDrawer, {
  CommonModalSwitchDrawerProps,
} from 'components/CommonModalSwitchDrawer';
import styles from './styles.module.scss';
import { TWithdrawInfoSuccess } from 'types/deposit';
import { valueFixed2LessThanMin } from 'utils/calculate';
import { TokenType, defaultNullValue } from 'constants/index';
import { useMemo } from 'react';
import { ARRIVAL_TIME_CONFIG } from 'constants/withdraw';
import { AllSupportedELFChainId } from 'constants/chain';

interface SuccessModalProps {
  withdrawInfo: TWithdrawInfoSuccess;
  modalProps: CommonModalSwitchDrawerProps;
}

const isNeedQuota = (symbol: TokenType, chainId: AllSupportedELFChainId) => {
  if (!symbol || !chainId) return false;
  if (
    [TokenType.ELF, TokenType.USDT].includes(symbol) &&
    ARRIVAL_TIME_CONFIG[symbol].chainList.includes(chainId)
  )
    return true;
  return false;
};

export default function SuccessModal({ withdrawInfo, modalProps }: SuccessModalProps) {
  const arrivalTime = useMemo(() => {
    const symbol = withdrawInfo.symbol as TokenType;
    const chainId = withdrawInfo.network.network as unknown as AllSupportedELFChainId;
    if (
      isNeedQuota(symbol, chainId) &&
      withdrawInfo.amount <= ARRIVAL_TIME_CONFIG[symbol].dividingQuota
    ) {
      return '30s';
    } else {
      return withdrawInfo.arriveTime;
    }
  }, [
    withdrawInfo.amount,
    withdrawInfo.arriveTime,
    withdrawInfo.network.network,
    withdrawInfo.symbol,
  ]);

  return (
    <CommonModalSwitchDrawer {...modalProps} hideCancelButton okText="Yes, I know">
      <div className={clsx('flex-column', styles['container'])}>
        <div className={clsx('flex-column-center', styles['title-wrapper'])}>
          <div className={clsx('flex-center', styles['title-icon'])}>
            <CheckFilledIcon />
          </div>
          <div className={styles['title']}>Withdrawal Request Submitted</div>
        </div>
        <div className={clsx('flex-column-center', styles['main-info-wrapper'])}>
          <div className={styles['label']}>
            Amount to Be Received on {withdrawInfo.network.name}
          </div>
          <div className={styles['value']}>
            <span className={styles['value-center']}>
              {withdrawInfo.receiveAmount || defaultNullValue} {withdrawInfo.symbol}
            </span>
            <div className={clsx(styles['receive-amount-usd'])}>
              {valueFixed2LessThanMin(withdrawInfo.receiveAmountUsd, '$ ')}
            </div>
          </div>
        </div>
        <div className={styles['divider']} />
        <div className={clsx('flex-column', styles['detail-wrapper'])}>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Withdrawal Amount</div>
            <div className={styles['value']}>
              {withdrawInfo.amount} {withdrawInfo.symbol}
            </div>
          </div>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Arrival Time</div>
            <div className={styles['value']}>≈ {arrivalTime}</div>
          </div>
        </div>
      </div>
    </CommonModalSwitchDrawer>
  );
}
