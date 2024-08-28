import { useEffect, useMemo, useRef, useState } from 'react';
import { TGetRecordDetailResult } from 'types/api';
import { useAppDispatch, useCommonState, useLoading } from 'store/Provider/hooks';
import MobileTransferDetail from './MobileTransferDetail';
import WebTransferDetail from './WebTransferDetail';
import { getRecordDetail } from 'utils/api/records';
import { useRouter, useSearchParams } from 'next/navigation';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import { SideMenuKey } from 'constants/home';
import { useEffectOnce } from 'react-use';
import { useIsLogin } from 'hooks/wallet';
import { sleep } from '@etransfer/utils';
import { useSetAuthFromStorage } from 'hooks/authToken';
import { TOrderStatus } from 'types/records';

export default function TransferDetail() {
  const { isPadPX } = useCommonState();
  const { setLoading } = useLoading();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLogin = useIsLogin();
  const isLoginRef = useRef(isLogin);
  isLoginRef.current = isLogin;

  const [detailData, setDetailData] = useState<TGetRecordDetailResult>();

  const setAuthFromStorage = useSetAuthFromStorage();

  const getDetailRef = useRef<(isLoading?: boolean) => Promise<void>>();
  const updateTimerRef = useRef<NodeJS.Timer | number>();
  const { getDetail, stopTimer } = useMemo(() => {
    const getDetail = async (isLoading = true) => {
      try {
        const id = searchParams.get('id');
        if (!id || !isLoginRef.current) {
          router.push('/history');
          return;
        }

        const authResult = await setAuthFromStorage();
        if (!authResult) return;
        await sleep(500);

        isLoading && setLoading(true);

        const data = await getRecordDetail(id);
        setDetailData(data);

        if (data.status === TOrderStatus.Processing) {
          // Interval update transfer detail
          resetTimer();
        } else {
          // Stop interval
          stopTimer();
        }
      } catch (error) {
        console.log('getRecordDetail error', error);
      } finally {
        setLoading(false);
      }
    };
    getDetailRef.current = getDetail;

    const handleSetTimer = async () => {
      updateTimerRef.current = setInterval(() => {
        getDetailRef.current?.(false);
      }, 30 * 1000);
    };

    const resetTimer = () => {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;

      handleSetTimer();
    };

    const stopTimer = () => {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
    };

    return { getDetail, stopTimer };
  }, [router, searchParams, setAuthFromStorage, setLoading]);

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.History));
  });

  useEffect(() => {
    if (isLogin) {
      getDetail();
    } else {
      router.push('/history');
    }

    return () => {
      stopTimer();
    };
  }, [getDetail, isLogin, router, stopTimer]);

  if (detailData?.id) {
    return isPadPX ? (
      <MobileTransferDetail {...detailData} />
    ) : (
      <WebTransferDetail {...detailData} />
    );
  } else {
    return null;
  }
}
