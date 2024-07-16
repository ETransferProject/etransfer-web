import { useMemo } from 'react';
import { usePortkeyWalletState } from 'store/Provider/hooks';

export function useAccounts() {
  const { v2 } = usePortkeyWalletState();

  const accounts = useMemo(() => {
    return v2.accounts;
  }, [v2.accounts]);
  return accounts;
}
