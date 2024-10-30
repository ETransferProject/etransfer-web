import clsx from 'clsx';
import styles from './styles.module.scss';
import { SideMenuKey } from 'constants/home';
import { NetworkStatus } from 'types/api';
import { formatNetworkKey, formatSymbolDisplay } from 'utils/format';
import NetworkLogo from 'components/NetworkLogo';

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
  network: string;
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
  network,
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
      <div className={clsx('flex-row', styles['network-card-name-row'])}>
        <NetworkLogo network={network} size={'normal'} />
        <div className={styles['network-card-name']}>
          {name}
          {status === NetworkStatus.Offline && (
            <span className={styles['network-card-network-suspended']}>Suspended</span>
          )}
        </div>
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
        'flex-row-center',
        styles['network-card-for-web'],
        styles['network-card-for-web-hover'],
        (isDisabled || status === NetworkStatus.Offline) && styles['network-card-disabled'],
        className,
      )}
      onClick={onClick}>
      <NetworkLogo network={network} size="big" />
      <div className="flex-column flex-1">
        <div className={clsx('flex-row-center-between', styles['network-card-row'])}>
          <span className={styles['network-card-network']}>
            {formatNetworkKey(network)}
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
    </div>
  );
}
