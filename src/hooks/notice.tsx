import { etransferCore } from '@etransfer/ui-react';
import { ETransferHost } from 'constants/index';
import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from 'store/Provider/hooks';
import {
  setDepositProcessingCount,
  setTransferProcessingCount,
  setWithdrawProcessingCount,
} from 'store/reducers/records/slice';
import { handleNoticeDataAndShow } from 'utils/notice';
import { TOrderRecordsNoticeResponse } from '@etransfer/socket';
import myEvents from 'utils/myEvent';
import { useGetAllConnectedWalletAccount } from './wallet';
import { useDebounceCallback } from './debounce';
import { eTransferInstance } from 'utils/etransferInstance';

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

  const openAndUpdateSocket = useDebounceCallback(async () => {
    etransferCore.setSocketUrl(ETransferHost);
    const addressList = getAllConnectedWalletAccount();
    const accountListWithWalletType = addressList.accountListWithWalletType;

    const mainFunction = () => {
      eTransferInstance.setNoticeStorageAddresses(accountListWithWalletType);
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
    };
    if (Array.isArray(accountListWithWalletType) && accountListWithWalletType.length > 0) {
      if (!etransferCore.noticeSocket?.signalr?.connectionId) {
        etransferCore.noticeSocket
          ?.doOpen()
          .then((res) => {
            console.log('NoticeSocket doOpen res:', res);
            mainFunction();
          })
          .catch((error) => {
            console.log('NoticeSocket doOpen error', error);
          });
      } else {
        // TODO dev in sdk
        await etransferCore.noticeSocket.UnsubscribeUserOrderRecord(
          undefined,
          eTransferInstance.noticeStorageAddresses,
        );
        mainFunction();
      }
    }
  }, [getAllConnectedWalletAccount]);

  useEffect(() => {
    openAndUpdateSocket();
  }, [openAndUpdateSocket]);
}
