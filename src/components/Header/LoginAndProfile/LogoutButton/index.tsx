import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useClearStore } from 'hooks/common';
import myEvents from 'utils/myEvent';
import service from 'api/axios';

type TLogoutButtonType = {
  closeDialog?: () => void;
};

export default function LogoutButton({ closeDialog }: TLogoutButtonType) {
  const { disConnectWallet } = useConnectWallet();
  const clearStore = useClearStore();

  const handleLogoutWallet = useCallback(async () => {
    Promise.resolve(disConnectWallet()).then(() => {
      clearStore();
      service.defaults.headers.common['Authorization'] = '';
      myEvents.LogoutSuccess.emit();
      console.warn('>>>>>> logout');
    });
    closeDialog?.();
  }, [clearStore, closeDialog, disConnectWallet]);

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
