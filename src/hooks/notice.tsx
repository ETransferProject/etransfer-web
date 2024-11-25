import { etransferCore } from '@etransfer/ui-react';
import { ETransferHost } from 'constants/index';
import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from 'store/Provider/hooks';
import {
  setDepositProcessingCount,
  setTransferProcessingCount,
  setWithdrawProcessingCount,
  // setTransferProcessingCount,
} from 'store/reducers/records/slice';
import { handleNoticeDataAndShow } from 'utils/notice';
import { TOrderRecordsNoticeResponse } from '@etransfer/socket';
import myEvents from 'utils/myEvent';
import { useGetAllConnectedWalletAccount } from './wallet/authToken';

export function useNoticeSocket() {
  const dispatch = useAppDispatch();
  const getAllConnectedWalletAccount = useGetAllConnectedWalletAccount();

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

        if (res.processing.transferCount) {
          dispatch(setTransferProcessingCount(res.processing.transferCount));
        } else {
          dispatch(setTransferProcessingCount(0));
        }

        myEvents.GlobalTxnNotice.emit();
        // handle order data and show notice
        handleNoticeDataAndShow(res);
      }
    },
    [dispatch],
  );

  const handleNoticeRef = useRef(handleNotice);
  handleNoticeRef.current = handleNotice;

  useEffect(() => {
    etransferCore.setSocketUrl(ETransferHost);
    const addressList = getAllConnectedWalletAccount();
    const accountListWithWalletType = addressList.accountListWithWalletType;
    if (
      Array.isArray(accountListWithWalletType) &&
      accountListWithWalletType.length > 0 &&
      !etransferCore.noticeSocket?.signalr?.connectionId
    ) {
      etransferCore.noticeSocket
        ?.doOpen()
        .then((res) => {
          console.log('NoticeSocket doOpen res:', res);
          etransferCore.noticeSocket?.RequestUserOrderRecord({
            addressList: accountListWithWalletType,
          });
          etransferCore.noticeSocket?.ReceiveUserOrderRecords(
            {
              addressList: accountListWithWalletType,
            },
            (res) => {
              console.log(
                'NoticeSocket ReceiveUserOrderRecords res:',
                res,
                etransferCore.noticeSocket?.signalr?.connectionId,
              );
              handleNoticeRef.current(res);
            },
          );
          etransferCore.noticeSocket?.signalr?.onreconnected((id?: string) => {
            console.log('NoticeSocket onreconnected:', id);
            etransferCore.noticeSocket?.RequestUserOrderRecord({
              addressList: accountListWithWalletType,
            });
          });
        })
        .catch((error) => {
          console.log('NoticeSocket doOpen error', error);
        });
    }
  }, [getAllConnectedWalletAccount]);
}
