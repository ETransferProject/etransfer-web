import { NightElf_16, PortkeyV2_16 } from 'assets/images';
import CommonButton, { CommonButtonProps, CommonButtonType } from 'components/CommonButton';
import { CONNECT_AELF_WALLET, MY_AELF_WALLET, UNLOCK } from 'constants/wallet/index';
import useAelf, { useShowLoginButtonLoading } from 'hooks/wallet/useAelf';
import { useMemo } from 'react';
import styles from '../styles.module.scss';
import { useCommonState } from 'store/Provider/hooks';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';

export default function ConnectAelfWalletButton(props: CommonButtonProps) {
  const { isMobilePX } = useCommonState();
  const { isLocking, isConnected, connector } = useAelf();
  // Fix: It takes too long to obtain NightElf walletInfo, and the user mistakenly clicks the login button during this period.
  const isLoginButtonLoading = useShowLoginButtonLoading();

  const renderElement = useMemo(() => {
    if (isLocking) {
      <CommonButton id="ConnectWalletButton" {...props} loading={isLoginButtonLoading}>
        {UNLOCK}
      </CommonButton>;
    }

    if (isConnected) {
      return (
        <CommonButton
          id="ConnectWalletButton"
          type={CommonButtonType.Border}
          {...props}
          loading={isLoginButtonLoading}
          ghost>
          {/* TODO FairyVaultDiscover icon */}
          {connector === AelfWalletTypeEnum.elf ? <NightElf_16 /> : <PortkeyV2_16 />}
          {!isMobilePX && (
            <span className={styles['connected-wallet-button-text']}>{MY_AELF_WALLET}</span>
          )}
        </CommonButton>
      );
    }

    return (
      <CommonButton id="ConnectWalletButton" {...props} loading={isLoginButtonLoading}>
        {CONNECT_AELF_WALLET}
      </CommonButton>
    );
  }, [connector, isConnected, isLocking, isLoginButtonLoading, isMobilePX, props]);

  return renderElement;
}
