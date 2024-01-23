import { qrCodePlaceholder } from 'assets/images';
import clsx from 'clsx';
import CommonImage from 'components/CommonImage';
import styles from './styles.module.scss';
import { DepositRetryBtnText, DepositRetryText } from 'constants/deposit';
import CommonButton from 'components/CommonButton';

export type DepositRetry = {
  isShowImage?: boolean;
  onClick: () => void;
};

export default function DepositRetry({ isShowImage = false, onClick }: DepositRetry) {
  return (
    <div className={clsx('flex-row-center', styles['deposit-address-wrapper'])}>
      {isShowImage && (
        <CommonImage
          className={clsx('flex-none', styles['qr-code-placeholder'])}
          src={qrCodePlaceholder}
          alt="qrCodePlaceholder"
        />
      )}

      <div>{DepositRetryText}</div>
      <CommonButton onClick={onClick}>{DepositRetryBtnText}</CommonButton>
    </div>
  );
}
