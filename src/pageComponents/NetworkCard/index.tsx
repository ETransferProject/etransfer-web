import clsx from 'clsx';
import styles from './styles.module.scss';
import { SideMenuKey } from 'constants/home';

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
}

interface NetworkCardForWebProps extends NetworkCardProps {
  network: string;
}

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
}: NetworkCardProps) {
  return (
    <div
      className={clsx(
        styles['network-card-for-mobile'],
        isDisabled && styles['network-card-disabled'],
        className,
      )}
      onClick={onClick}>
      <div className={styles['network-card-name']}>{name}</div>
      <div className={styles['network-card-arrival-time']}>
        <span>Arrival Time ≈ </span>
        <span>{multiConfirmTime}</span>
      </div>
      <div className={styles['network-card-confirm-time']}>
        {type === SideMenuKey.Deposit
          ? multiConfirm
          : `Fee: ${transactionFee} ${transactionFeeUnit}`}
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
}: NetworkCardForWebProps) {
  return (
    <div
      className={clsx(
        'flex-column',
        styles['network-card-for-web'],
        styles['network-card-for-web-hover'],
        isDisabled && styles['network-card-disabled'],
        className,
      )}
      onClick={onClick}>
      <div className={clsx('flex-row-center-between', styles['network-card-row'])}>
        <span className={styles['network-card-network']}>{network}</span>
        <span className={styles['network-card-arrival-time']}>≈ {multiConfirmTime}</span>
      </div>
      <div className={clsx('flex-row-center-between', styles['network-card-row'])}>
        <span className={styles['network-card-name']}>{name}</span>
        <span className={styles['network-card-confirm-time']}>
          {type === SideMenuKey.Deposit
            ? multiConfirm
            : `Fee: ${transactionFee || '-'} ${transactionFeeUnit || 'USDT'}`}
        </span>
      </div>
    </div>
  );
}
