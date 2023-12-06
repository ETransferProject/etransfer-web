import { useCallback, useMemo } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { emitLoading } from 'utils/events';
import { LoadingProps } from 'components/Loading';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useCommonState = () => useAppSelector((state) => state.common);
export const usePortkeyWalletState = () => useAppSelector((state) => state.portkeyWallet);
export const useTokenState = () => useAppSelector((state) => state.token);
export const useUserActionState = () => useAppSelector((state) => state.userAction);

export const useLoading = () => {
  const _setLoading = useCallback(
    (isLoading: boolean, loadingInfo?: LoadingProps) => emitLoading(isLoading, loadingInfo),
    [],
  );
  return useMemo(() => ({ setLoading: _setLoading }), [_setLoading]);
};
