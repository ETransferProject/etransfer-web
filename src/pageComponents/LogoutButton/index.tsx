import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import { useWebLogin } from 'aelf-web-login';

type TLogoutButtonType = {
  setIsOpen?: (value: boolean) => void;
};

export default function LogoutButton({ setIsOpen }: TLogoutButtonType) {
  const { logout } = useWebLogin();

  const handleLogoutWallet = useCallback(async () => {
    await logout();
    setIsOpen && setIsOpen(false);
  }, [logout, setIsOpen]);

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
