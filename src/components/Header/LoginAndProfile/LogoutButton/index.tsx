import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import { WalletType, useWebLogin } from 'aelf-web-login';
import { useClearStore } from 'hooks/common';

type TLogoutButtonType = {
  closeDialog?: () => void;
};

export default function LogoutButton({ closeDialog }: TLogoutButtonType) {
  const { logout, walletType } = useWebLogin();
  const clearStore = useClearStore();

  const handleLogoutWallet = useCallback(async () => {
    await Promise.resolve(logout()).then(() => {
      // Fix: The login token is cleared by the SDK, but the SDK returns a logout failure, resulting in the store not being cleared and the page status being incorrect.
      if (walletType === WalletType.discover) {
        clearStore();
      }
    });
    closeDialog?.();
  }, [clearStore, closeDialog, logout, walletType]);

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
