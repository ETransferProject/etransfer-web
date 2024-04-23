import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import { useResetStore } from 'store/Provider/hooks';
import { useWebLogin } from 'aelf-web-login';
import { useAppDispatch } from 'store/Provider/hooks';
import { setV2DisconnectedAction } from 'store/reducers/portkeyWallet/actions';
import { setSwitchVersionAction } from 'store/reducers/common/slice';
import { setHandleReset } from 'store/reducers/records/slice';

export default function LogoutButton() {
  const resetStore = useResetStore();
  const { logout } = useWebLogin();
  const dispatch = useAppDispatch();

  const handleLogoutWallet = useCallback(async () => {
    await logout({ noModal: true });
    dispatch(setV2DisconnectedAction());
    dispatch(setSwitchVersionAction(undefined));
    dispatch(setHandleReset());
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
