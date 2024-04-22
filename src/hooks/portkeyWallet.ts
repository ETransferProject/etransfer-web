import { useMemo } from 'react';
import { usePortkeyWalletState } from 'store/Provider/hooks';

export function useIsActive() {
  const { v2 } = usePortkeyWalletState();
  // only suport v2
  const isActive = v2.isActive;
  return isActive;
}

export function useAccounts() {
  const { v2 } = usePortkeyWalletState();

  const accounts = useMemo(() => {
    return v2.accounts;
  }, [v2.accounts]);
  return accounts;
}
