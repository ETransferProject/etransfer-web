import { WebLoginState, WalletType } from 'aelf-web-login';
import { useWalletContext } from 'provider/walletProvider';
import { useMemo } from 'react';

export function useIsLogin() {
  const [{ loginState }] = useWalletContext();
  return useMemo(() => loginState === WebLoginState.logined, [loginState]);
}

export function useIsPortkeyLogin() {
  const [{ wallet }] = useWalletContext();
  const isLogin = useIsLogin();

  return useMemo(
    () => isLogin && wallet?.walletType === WalletType.portkey,
    [isLogin, wallet?.walletType],
  );
}
