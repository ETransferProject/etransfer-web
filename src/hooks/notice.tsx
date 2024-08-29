import { etransferCore } from '@etransfer/ui-react';
import { ETransferHost } from 'constants/index';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch } from 'store/Provider/hooks';
import {
  setDepositProcessingCount,
  setWithdrawProcessingCount,
} from 'store/reducers/records/slice';
import { handleNoticeDataAndShow } from 'utils/notice';
import { useGetAccount } from './wallet';
import { removeAddressSuffix } from '@etransfer/utils';
import { TOrderRecordsNoticeResponse } from '@etransfer/socket';

export function useNoticeSocket() {
  const dispatch = useAppDispatch();
  const account = useGetAccount();
  const address = useMemo(() => {
    return removeAddressSuffix(account?.AELF || '');
  }, [account?.AELF]);

  const handleNotice = useCallback(
    (res: TOrderRecordsNoticeResponse | null) => {
      if (res) {
        if (res.processing.depositCount) {
          dispatch(setDepositProcessingCount(res.processing.depositCount));
        } else {
          dispatch(setDepositProcessingCount(0));
        }

        if (res.processing.withdrawCount) {
          dispatch(setWithdrawProcessingCount(res.processing.withdrawCount));
        } else {
          dispatch(setWithdrawProcessingCount(0));
        }

        // handle order data and show notice
        handleNoticeDataAndShow(res);
      }
    },
    [dispatch],
  );

  const handleNoticeRef = useRef(handleNotice);
  handleNoticeRef.current = handleNotice;

  const destroyNoticeSocket = useCallback(async () => {
    await etransferCore.noticeSocket?.UnsubscribeUserOrderRecord(address);
    await etransferCore.noticeSocket?.destroy();
  }, [address]);
  const destroyNoticeSocketRef = useRef(destroyNoticeSocket);
  destroyNoticeSocketRef.current = destroyNoticeSocket;

  useEffect(() => {
    etransferCore.setSocketUrl(ETransferHost);

    if (address) {
      etransferCore.noticeSocket
        ?.doOpen()
        .then((res) => {
          console.log('NoticeSocket doOpen res', res);
          etransferCore.noticeSocket?.RequestUserOrderRecord({
            address: address,
          });
          etransferCore.noticeSocket?.ReceiveUserOrderRecords(
            {
              address: address,
            },
            (res) => {
              handleNoticeRef.current(res);
            },
          );
        })
        .catch((error) => {
          console.log('NoticeSocket doOpen error', error);
        });
    }
    return () => {
      destroyNoticeSocketRef.current();
    };
  }, [address]);
}
