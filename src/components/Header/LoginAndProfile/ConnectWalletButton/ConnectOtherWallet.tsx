import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { CONNECT_WALLET } from 'constants/wallet';

export default function ConnectOtherWalletButton(props: CommonButtonProps) {
  return (
    <CommonButton id="ConnectWalletButton" {...props}>
      {CONNECT_WALLET}
    </CommonButton>
  );
}
