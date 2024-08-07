import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from 'store/Provider/hooks';
import { setIsUnreadHistory } from 'store/reducers/common/slice';
import { getRecordStatus } from 'utils/api/records';
import myEvents from 'utils/myEvent';
import { eTransferInstance } from 'utils/etransferInstance';
import { useSetAuthFromStorage } from './authToken';
import { sleep } from '@etransfer/utils';
import { useIsLogin } from './wallet';

export const MAX_UPDATE_TIME = 6;

export function useUpdateRecord() {
  const dispatch = useAppDispatch();
  const isLogin = useIsLogin();
  const isLoginRef = useRef(isLogin);
  isLoginRef.current = isLogin;
  const setAuthFromStorage = useSetAuthFromStorage();

  const updateRecordStatus = useCallback(async () => {
    if (!isLoginRef.current) return;
    if (eTransferInstance.unauthorized) return;

    try {
      const res = await getRecordStatus();
      dispatch(setIsUnreadHistory(res.status));
    } catch (error) {
      console.log('update new records error', error);
    }
  }, [dispatch]);

  const updateTimeRef = useRef(MAX_UPDATE_TIME);
  const updateTimerRef = useRef<NodeJS.Timer | number>();
  const handleSetTimer = useCallback(async () => {
    updateTimerRef.current = setInterval(() => {
      --updateTimeRef.current;

      if (updateTimeRef.current === 0) {
        updateRecordStatus();
        updateTimeRef.current = MAX_UPDATE_TIME;
      }
    }, 1000);
  }, [updateRecordStatus]);

  const resetTimer = useCallback(() => {
    clearInterval(updateTimerRef.current);
    updateTimerRef.current = undefined;
    updateTimeRef.current = MAX_UPDATE_TIME;
    handleSetTimer();
  }, [handleSetTimer]);

  const init = useCallback(async () => {
    await setAuthFromStorage();
    await sleep(2000);

    updateRecordStatus();
  }, [setAuthFromStorage, updateRecordStatus]);

  useEffect(() => {
    if (!isLogin) return;
    // start 6s countdown
    resetTimer();
    // then, get one-time new record
    init();

    const { remove } = myEvents.UpdateNewRecordStatus.addListener(() => {
      updateRecordStatus();
    });
    return () => {
      remove();
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
    };
  }, [init, isLogin, resetTimer, updateRecordStatus]);
}
