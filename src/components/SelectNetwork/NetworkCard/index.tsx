import clsx from 'clsx';
import styles from './styles.module.scss';
import { SideMenuKey } from 'constants/home';
import { NetworkStatus } from 'types/api';
import { useMemo } from 'react';
import { formatSymbolDisplay } from 'utils/format';

interface NetworkCardProps {
  type: SideMenuKey;
  transactionFee?: string;
  transactionFeeUnit?: string;
  name: string;
  multiConfirmTime: string;
  multiConfirm: string;
  className?: string;
  isDisabled?: boolean;
  onClick: () => void;
  status: string;
}

interface NetworkCardForWebProps extends NetworkCardProps {
  network: string;
}

const feeContent = (transactionFee?: string, transactionFeeUnit?: string) => {
  return transactionFee
    ? `Fee: ${transactionFee} ${formatSymbolDisplay(transactionFeeUnit || '')}`
    : 'Fee: Failed to estimate the fee.';
};

export function NetworkCardForMobile({
  type,
  transactionFee,
  transactionFeeUnit,
  className,
  name,
  multiConfirmTime,
  multiConfirm,
  isDisabled = false,
  onClick,
  status,
}: NetworkCardProps) {
  return (
    <div
      className={clsx(
        styles['network-card-for-mobile'],
        (isDisabled || status === NetworkStatus.Offline) && styles['network-card-disabled'],
        className,
      )}
      onClick={onClick}>
      <div className={styles['network-card-name']}>
        {name}
        {status === NetworkStatus.Offline && (
          <span className={styles['network-card-network-suspended']}>Suspended</span>
        )}
      </div>

      <div className={styles['network-card-arrival-time']}>
        <span>Arrival Time ≈ </span>
        <span>{multiConfirmTime}</span>
      </div>
      <div className={styles['network-card-confirm-time']}>
        {type === SideMenuKey.Deposit
          ? multiConfirm
          : feeContent(transactionFee, transactionFeeUnit)}
      </div>
    </div>
  );
}

export function NetworkCardForWeb({
  type,
  transactionFee,
  transactionFeeUnit,
  className,
  network,
  name,
  multiConfirmTime,
  multiConfirm,
  isDisabled = false,
  onClick,
  status,
}: NetworkCardForWebProps) {
  return (
    <div
      className={clsx(
        'flex-column',
        styles['network-card-for-web'],
        styles['network-card-for-web-hover'],
        (isDisabled || status === NetworkStatus.Offline) && styles['network-card-disabled'],
        className,
      )}
      onClick={onClick}>
      <div className={clsx('flex-row-center-between', styles['network-card-row'])}>
        <span className={styles['network-card-network']}>
          {network}
          {status === NetworkStatus.Offline && (
            <span className={styles['network-card-network-suspended']}>Suspended</span>
          )}
        </span>
        <span className={styles['network-card-arrival-time']}>≈ {multiConfirmTime}</span>
      </div>
      <div className={clsx('flex-row-center-between', styles['network-card-row'])}>
        <span className={styles['network-card-name']}>{name}</span>
        <span className={styles['network-card-confirm-time']}>
          {type === SideMenuKey.Deposit
            ? multiConfirm
            : feeContent(transactionFee, transactionFeeUnit)}
        </span>
      </div>
    </div>
  );
}
