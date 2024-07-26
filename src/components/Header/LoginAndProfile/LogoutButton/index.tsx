import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useClearStore } from 'hooks/common';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';

type TLogoutButtonType = {
  closeDialog?: () => void;
};

export default function LogoutButton({ closeDialog }: TLogoutButtonType) {
  const { disConnectWallet, walletType } = useConnectWallet();
  const clearStore = useClearStore();

  const handleLogoutWallet = useCallback(async () => {
    Promise.resolve(disConnectWallet()).then(() => {
      // Fix: The login token is cleared by the SDK, but the SDK returns a logout failure, resulting in the store not being cleared and the page status being incorrect.
      if (walletType === WalletTypeEnum.discover) {
        clearStore();
      }
    });
    closeDialog?.();
  }, [clearStore, closeDialog, disConnectWallet, walletType]);

  return (
    <CommonButton
      type={CommonButtonType.Secondary}
      size={CommonButtonSize.Small}
      stretched
      onClick={handleLogoutWallet}>
      Log Out
    </CommonButton>
  );
}
