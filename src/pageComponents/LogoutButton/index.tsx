import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';

export default function LogoutButton() {
  const { deactivate } = usePortkeyProvider();
  const handleLogoutWallet = useCallback(async () => {
    deactivate();
  }, [deactivate]);

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
