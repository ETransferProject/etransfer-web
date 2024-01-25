import { PortkeyVersion } from 'constants/index';
import { useMemo } from 'react';
import { usePortkeyWalletState } from 'store/Provider/hooks';

export function useIsActive() {
  const { currentVersion, v1, v2 } = usePortkeyWalletState();

  const isActive = useMemo(
    () => (currentVersion === PortkeyVersion.v1 ? v1.isActive : v2.isActive),
    [currentVersion, v1.isActive, v2.isActive],
  );
  return isActive;
}

export function useAccounts() {
  const { currentVersion, v1, v2 } = usePortkeyWalletState();

  const accounts = useMemo(
    () => (currentVersion === PortkeyVersion.v1 ? v1.accounts : v2.accounts),
    [currentVersion, v1.accounts, v2.accounts],
  );
  return accounts;
}
