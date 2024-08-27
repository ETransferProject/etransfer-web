import { useCallback, useEffect, useRef, useState } from 'react';
import { TGetRecordDetailResult, TransactionRecordStep } from 'types/api';
import { useAppDispatch, useCommonState, useLoading } from 'store/Provider/hooks';
import MobileHistoryDetail from './MobileHistoryDetail';
import WebHistoryDetail from './WebHistoryDetail';
import { getRecordDetail } from 'utils/api/records';
import { useRouter, useSearchParams } from 'next/navigation';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import { SideMenuKey } from 'constants/home';
import { useEffectOnce } from 'react-use';
import { useIsLogin } from 'hooks/wallet';
import { sleep } from '@etransfer/utils';
import { useSetAuthFromStorage } from 'hooks/authToken';
import { TOrderStatus } from 'types/records';

export default function HistoryDetail() {
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
  const getDetail = useCallback(async () => {
    try {
      const id = searchParams.get('id');
      if (!id || !isLoginRef.current) {
        router.push('/history');
        return;
      }

      const authResult = await setAuthFromStorage();
      if (!authResult) return;
      await sleep(500);

      setLoading(true);

      const data = await getRecordDetail(id);

      setDetailData(data);
    } catch (error) {
      console.log('getRecordDetail error', error);
    } finally {
      setLoading(false);
    }
  }, [router, searchParams, setAuthFromStorage, setLoading]);

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.History));
  });

  useEffect(() => {
    if (isLogin) {
      getDetail();
    } else {
      router.back();
    }
  }, [getDetail, isLogin, router]);

  if (detailData?.id) {
    return isPadPX ? <MobileHistoryDetail {...detailData} /> : <WebHistoryDetail {...detailData} />;
  } else {
    return null;
  }
}
