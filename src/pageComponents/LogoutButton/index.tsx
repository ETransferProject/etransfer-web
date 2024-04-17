import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';
import { useResetStore } from 'store/Provider/hooks';
import { useWebLogin } from 'aelf-web-login';

export default function LogoutButton() {
  const { deactivate } = usePortkeyProvider();
  const resetStore = useResetStore();
  const { logout } = useWebLogin();

  const handleLogoutWallet = useCallback(async () => {
    logout();
    deactivate();
    resetStore();
  }, [deactivate, resetStore, logout]);

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
