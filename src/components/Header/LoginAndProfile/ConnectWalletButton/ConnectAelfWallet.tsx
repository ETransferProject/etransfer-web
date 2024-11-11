import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { CONNECT_AELF_WALLET, UNLOCK } from 'constants/wallet';
import useAelf, { useShowLoginButtonLoading } from 'hooks/wallet/useAelf';

export default function ConnectAelfWalletButton(props: CommonButtonProps) {
  const { isLocking } = useAelf();
  // Fix: It takes too long to obtain NightElf walletInfo, and the user mistakenly clicks the login button during this period.
  const isLoginButtonLoading = useShowLoginButtonLoading();

  return (
    <CommonButton id="ConnectWalletButton" {...props} loading={isLoginButtonLoading}>
      {isLocking ? UNLOCK : CONNECT_AELF_WALLET}
    </CommonButton>
  );
}
