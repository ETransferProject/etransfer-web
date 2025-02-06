import { useCallback, useMemo } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { emitLoading } from 'utils/events';
import { LoadingProps } from 'components/Loading';
import { setIsUnreadHistory } from 'store/reducers/common/slice';
import { resetDepositState } from 'store/reducers/deposit/slice';
import { resetWithdrawState } from 'store/reducers/withdraw/slice';
import { resetRecordsWithoutFilter } from 'store/reducers/records/slice';
// import { resetInfoDashboardState } from 'store/reducers/infoDashboard/slice';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useCommonState = () => useAppSelector((state) => state.common);
export const useDepositState = () => useAppSelector((state) => state.deposit);
export const useWithdrawState = () => useAppSelector((state) => state.withdraw);
export const useWithdrawNewState = () => useAppSelector((state) => state.withdrawNew);
export const useCrossChainTransfer = () => useAppSelector((state) => state.crossChainTransfer);
export const useRecordsState = () => useAppSelector((state) => state.records);
export const useInfoDashboardState = () => useAppSelector((state) => state.infoDashboard);

export const useLoading = () => {
  const _setLoading = useCallback(
    (isLoading: boolean, loadingInfo?: LoadingProps) => emitLoading(isLoading, loadingInfo),
    [],
  );
  return useMemo(() => ({ setLoading: _setLoading }), [_setLoading]);
};

export const useResetStore = () => {
  const dispatch = useAppDispatch();

  return useCallback(() => {
    // dispatch(resetCommon());
    dispatch(setIsUnreadHistory(false));
    dispatch(resetDepositState());
    dispatch(resetWithdrawState());
    dispatch(resetRecordsWithoutFilter());
    // dispatch(resetInfoDashboardState());
  }, [dispatch]);
};
