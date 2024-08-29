import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { CheckNoticeIcon, CloseMedium } from 'assets/images';
import { eTransferInstance } from './etransferInstance';
import { etransferCore, formatSymbolDisplay } from '@etransfer/ui-react';
import clsx from 'clsx';
import { BusinessType } from 'types/api';
import { ETRANSFER_LOGO } from 'constants/misc';
import { TOrderRecordsNoticeResponse } from '@etransfer/socket';

export const browserNotification = ({ title, content }: { title: string; content: string }) => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications.');
    return;
  }

  function sendNotification() {
    new Notification(title, {
      body: content,
      icon: ETRANSFER_LOGO,
    });
  }
  if (window.Notification.permission === 'granted') {
    // Have permission
    sendNotification();
  } else if (window.Notification.permission !== 'denied') {
    // No permission, request permission
    window.Notification.requestPermission(function (_permission) {
      sendNotification();
    });
  }
};

const enum TTxnStatus {
  Successful = 'Successful',
  Failed = 'Failed',
}

export const showNotice = ({
  status,
  type,
  amount,
  symbol,
  isSwapFail,
  isShowBrowserNotice = true,
  noticeProps,
}: {
  status: TTxnStatus;
  type: BusinessType;
  amount: string;
  symbol: string;
  isSwapFail?: boolean;
  isShowBrowserNotice?: boolean;
  noticeProps?: ArgsProps;
}) => {
  if (!type || !status || !amount || !symbol) return;

  const title =
    status === TTxnStatus.Failed && isSwapFail
      ? 'Swap Failed'
      : `${type === BusinessType.Withdraw ? 'Withdrawal' : type} ${status}`;

  const typeText = type === BusinessType.Withdraw ? 'withdrawal' : type.toLowerCase();

  const content =
    status === TTxnStatus.Successful
      ? `The ${typeText} of ${amount} ${formatSymbolDisplay(symbol)} has been received.`
      : isSwapFail
      ? `Swap ${formatSymbolDisplay(
          symbol,
        )} failed, the ${typeText} of ${amount} USDT has been received.`
      : `The ${typeText} of ${amount} ${formatSymbolDisplay(
          symbol,
        )} failed; please check the transaction and contact customer service.`;

  notification.info({
    ...noticeProps,
    className: clsx(
      'etransfer-txn-notification',
      status === TTxnStatus.Successful
        ? 'etransfer-txn-notification-success'
        : 'etransfer-txn-notification-error',
    ),
    icon: <CheckNoticeIcon />,
    message: title,
    closeIcon: <CloseMedium />,
    description: content,
    placement: 'top',
    duration: noticeProps?.duration || 5,
  });

  if (isShowBrowserNotice) {
    browserNotification({ title, content });
  }
};

export const handleNoticeDataAndShow = (noticeData: TOrderRecordsNoticeResponse) => {
  // >>>>>> save processing
  noticeData.processing?.deposit?.forEach((item) => {
    if (!eTransferInstance.processingIds.includes(item.id)) {
      eTransferInstance.processingIds.push(item.id);
    }
  });

  noticeData.processing.withdraw?.forEach((item) => {
    if (!eTransferInstance.processingIds.includes(item.id)) {
      eTransferInstance.processingIds.push(item.id);
    }
  });

  // >>>>>> succeed notice
  noticeData.succeed?.deposit?.forEach((item) => {
    if (
      eTransferInstance.processingIds.includes(item.id) &&
      !eTransferInstance.showNoticeIds.includes(item.id)
    ) {
      showNotice({
        status: TTxnStatus.Successful,
        type: BusinessType.Deposit,
        amount: item.amount,
        symbol: item.symbol,
      });
      eTransferInstance.showNoticeIds.push(item.id);
    }
  });
  noticeData.succeed?.withdraw?.forEach((item) => {
    if (
      eTransferInstance.processingIds.includes(item.id) &&
      !eTransferInstance.showNoticeIds.includes(item.id)
    ) {
      showNotice({
        status: TTxnStatus.Successful,
        type: BusinessType.Withdraw,
        amount: item.amount,
        symbol: item.symbol,
      });
      eTransferInstance.showNoticeIds.push(item.id);
    }
  });

  // >>>>>> failed notice
  noticeData.failed?.deposit?.forEach((item) => {
    if (
      eTransferInstance.processingIds.includes(item.id) &&
      !eTransferInstance.showNoticeIds.includes(item.id)
    ) {
      showNotice({
        status: TTxnStatus.Failed,
        type: BusinessType.Deposit,
        amount: item.amount,
        symbol: item.symbol,
        isSwapFail: item.isSwap && item.isSwapFail,
      });
      eTransferInstance.showNoticeIds.push(item.id);
    }
  });
  noticeData.failed?.withdraw?.forEach((item) => {
    if (
      eTransferInstance.processingIds.includes(item.id) &&
      !eTransferInstance.showNoticeIds.includes(item.id)
    ) {
      showNotice({
        status: TTxnStatus.Failed,
        type: BusinessType.Withdraw,
        amount: item.amount,
        symbol: item.symbol,
      });
      eTransferInstance.showNoticeIds.push(item.id);
    }
  });
};

export const unsubscribeUserOrderRecord = async (address: string) => {
  eTransferInstance.setProcessingIds([]);
  eTransferInstance.setShowNoticeIds([]);
  await etransferCore.noticeSocket?.UnsubscribeUserOrderRecord(address);
  await etransferCore.noticeSocket?.destroy();
};
