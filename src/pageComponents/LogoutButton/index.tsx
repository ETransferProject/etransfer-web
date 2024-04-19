import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import { useResetStore } from 'store/Provider/hooks';
import { useWebLogin } from 'aelf-web-login';
import { useAppDispatch } from 'store/Provider/hooks';
import { setV2DisconnectedAction } from 'store/reducers/portkeyWallet/actions';
import { setSwitchVersionAction } from 'store/reducers/common/slice';

export default function LogoutButton() {
  const resetStore = useResetStore();
  const { logout } = useWebLogin();
  const dispatch = useAppDispatch();

  const handleLogoutWallet = useCallback(async () => {
    logout();
    dispatch(setV2DisconnectedAction());
    dispatch(setSwitchVersionAction(undefined));
    resetStore();
  }, [dispatch, resetStore, logout]);

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
