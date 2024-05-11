import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import { useWebLogin } from 'aelf-web-login';

type TLogoutButtonType = {
  closeDialog?: () => void;
};

export default function LogoutButton({ closeDialog }: TLogoutButtonType) {
  const { logout } = useWebLogin();

  const handleLogoutWallet = useCallback(async () => {
    await Promise.resolve(logout());
    closeDialog?.();
  }, [closeDialog, logout]);

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
