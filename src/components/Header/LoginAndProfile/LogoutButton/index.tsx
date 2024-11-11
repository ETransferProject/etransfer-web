import { useCallback } from 'react';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import useAelf from 'hooks/wallet/useAelf';
import { useClearStore } from 'hooks/common';
import myEvents from 'utils/myEvent';
import service from 'api/axios';
import { unsubscribeUserOrderRecord } from 'utils/notice';

type TLogoutButtonType = {
  closeDialog?: () => void;
};

export default function LogoutButton({ closeDialog }: TLogoutButtonType) {
  const { account, disconnect } = useAelf();
  const clearStore = useClearStore();

  const handleLogoutWallet = useCallback(async () => {
    Promise.resolve(disconnect()).then(() => {
      clearStore();
      service.defaults.headers.common['Authorization'] = '';
      myEvents.LogoutSuccess.emit();
      console.warn('>>>>>> logout');
      // stop notice socket
      unsubscribeUserOrderRecord(account || '');
    });
    closeDialog?.();
  }, [account, clearStore, closeDialog, disconnect]);

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
