import ConnectWalletButton from 'components/Header/LoginAndProfile/ConnectWalletButton';
import { CommonButtonSize } from 'components/CommonButton';
import styles from './styles.module.scss';

export default function LoginAndProfileEntry() {
  return (
    <ConnectWalletButton
      className={styles['connect-wallet-button']}
      size={CommonButtonSize.Small}
    />
  );
}
