import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { CONNECT_AELF_WALLET, UNLOCK } from 'constants/wallet';
import { useShowLoginButtonLoading } from 'hooks/wallet';

export default function ConnectAelfWalletButton(props: CommonButtonProps) {
  const { isLocking } = useConnectWallet();
  // Fix: It takes too long to obtain NightElf walletInfo, and the user mistakenly clicks the login button during this period.
  const isLoginButtonLoading = useShowLoginButtonLoading();

  return (
    <CommonButton id="ConnectWalletButton" {...props} loading={isLoginButtonLoading}>
      {isLocking ? UNLOCK : CONNECT_AELF_WALLET}
    </CommonButton>
  );
}
