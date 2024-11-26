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
import { TOrderStatus } from 'types/records';
import { DEFAULT_NULL_ORDER_ID } from 'constants/records';
import { useGetAllConnectedWalletAccount } from 'hooks/wallet/authToken';

export default function TransferDetail() {
  const { isPadPX } = useCommonState();
  const { setLoading } = useLoading();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [detailData, setDetailData] = useState<TGetRecordDetailResult>();

  const getDetailRef = useRef<(isLoading?: boolean) => Promise<void>>();
  const updateTimerRef = useRef<NodeJS.Timer | number>();
  const getAllConnectedWalletAccount = useGetAllConnectedWalletAccount();
  const { getDetail, stopTimer } = useMemo(() => {
    const getDetail = async (isLoading = true) => {
      try {
        const id = searchParams.get('id');
        if (!id) {
          router.push('/history');
          return;
        }

        isLoading && setLoading(true);

        const connectedAccountList = getAllConnectedWalletAccount();
        const data = await getRecordDetail(id, { addressList: connectedAccountList.accountList });
        // No data found
        if (data?.id === DEFAULT_NULL_ORDER_ID || !data?.createTime) {
          stopTimer();
          router.push('/history');
          return;
        }

        // Have the correct data
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
  }, [getAllConnectedWalletAccount, router, searchParams, setLoading]);

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.History));
  });

  useEffect(() => {
    getDetail();

    return () => {
      stopTimer();
    };
  }, [getDetail, stopTimer]);

  if (detailData?.id && detailData?.id !== DEFAULT_NULL_ORDER_ID && detailData?.createTime) {
    return isPadPX ? (
      <MobileTransferDetail {...detailData} />
    ) : (
      <WebTransferDetail {...detailData} />
    );
  } else {
    return null;
  }
}
