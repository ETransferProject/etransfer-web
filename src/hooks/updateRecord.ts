import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from 'store/Provider/hooks';
import { setIsUnreadHistory } from 'store/reducers/common/slice';
import { getRecordStatus } from 'utils/api/records';
import myEvents from 'utils/myEvent';
import { useIsActive } from './portkeyWallet';

export const MAX_UPDATE_TIME = 6;

export function useUpdateRecord() {
  const dispatch = useAppDispatch();
  const isActive = useIsActive();

  const updateRecordStatus = useCallback(async () => {
    if (!isActive) return;

    try {
      const res = await getRecordStatus();
      dispatch(setIsUnreadHistory(res.status));
    } catch (error) {
      console.log('update new records error', error);
    }
  }, [dispatch, isActive]);

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

  useEffect(() => {
    // start 6s countdown
    resetTimer();
    // then, get one-time new record
    updateRecordStatus();

    const { remove } = myEvents.UpdateNewRecordStatus.addListener(() => {
      updateRecordStatus();
    });
    return () => {
      remove();
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
    };
  }, [resetTimer, updateRecordStatus]);
}
