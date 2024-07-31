import { useCallback, useMemo } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { emitLoading } from 'utils/events';
import { LoadingProps } from 'components/Loading';
// import { resetCommon } from 'store/reducers/common/slice';
import { resetDepositState } from 'store/reducers/deposit/slice';
import { resetWithdrawState } from 'store/reducers/withdraw/slice';
import { resetRecordsState } from 'store/reducers/records/slice';
// import { resetInfoDashboardState } from 'store/reducers/infoDashboard/slice';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useCommonState = () => useAppSelector((state) => state.common);
export const useDepositState = () => useAppSelector((state) => state.deposit);
export const useWithdrawState = () => useAppSelector((state) => state.withdraw);
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
    dispatch(resetDepositState());
    dispatch(resetWithdrawState());
    dispatch(resetRecordsState());
    // dispatch(resetInfoDashboardState());
  }, [dispatch]);
};
