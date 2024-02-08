import { PortkeyVersion } from 'constants/wallet';
import { useMemo } from 'react';
import { useCommonState, usePortkeyWalletState } from 'store/Provider/hooks';

export function useIsActive() {
  const { currentVersion } = useCommonState();
  const { v1, v2 } = usePortkeyWalletState();

  const isActive = useMemo(() => {
    if (!currentVersion) return false;
    return currentVersion === PortkeyVersion.v1 ? v1.isActive : v2.isActive;
  }, [currentVersion, v1.isActive, v2.isActive]);
  return isActive;
}

export function useAccounts() {
  const { currentVersion } = useCommonState();
  const { v1, v2 } = usePortkeyWalletState();

  const accounts = useMemo(() => {
    if (!currentVersion) return {};
    return currentVersion === PortkeyVersion.v1 ? v1.accounts : v2.accounts;
  }, [currentVersion, v1.accounts, v2.accounts]);
  return accounts;
}
