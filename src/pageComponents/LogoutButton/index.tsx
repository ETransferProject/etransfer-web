import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';
import { useResetStore } from 'store/Provider/hooks';

export default function LogoutButton() {
  const { deactivate } = usePortkeyProvider();
  const resetStore = useResetStore();

  const handleLogoutWallet = useCallback(async () => {
    deactivate();
    resetStore();
  }, [deactivate, resetStore]);

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
