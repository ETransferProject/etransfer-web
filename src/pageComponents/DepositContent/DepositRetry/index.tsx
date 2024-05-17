import { qrCodePlaceholder } from 'assets/images';
import clsx from 'clsx';
import CommonImage from 'components/CommonImage';
import styles from './styles.module.scss';
import { DepositRetryBtnText, DepositRetryText } from 'constants/deposit';
import CommonButton, { CommonButtonSize } from 'components/CommonButton';

export type TDepositRetry = {
  isShowImage?: boolean;
  onClick?: () => void;
};

export function DepositRetryForWeb({ isShowImage = false, onClick }: TDepositRetry) {
  return (
    <div
      className={clsx('flex-row-center', styles['deposit-retry'], styles['deposit-retry-for-web'])}>
      {isShowImage && (
        <CommonImage
          className={clsx('flex-none', styles['qr-code-placeholder'])}
          src={qrCodePlaceholder}
          alt="qrCodePlaceholder"
        />
      )}

      <div className="flex-column">
        <span className={styles.retryText}>{DepositRetryText}</span>
        <CommonButton className={styles.retryBtn} size={CommonButtonSize.Small} onClick={onClick}>
          {DepositRetryBtnText}
        </CommonButton>
      </div>
    </div>
  );
}

export function DepositRetryForMobile({ onClick }: TDepositRetry) {
  return (
    <div className={clsx('flex-column', styles['deposit-retry'])}>
      <span className={styles.retryText}>{DepositRetryText}</span>
      <CommonButton className={styles.retryBtn} size={CommonButtonSize.Small} onClick={onClick}>
        {DepositRetryBtnText}
      </CommonButton>
    </div>
  );
}
