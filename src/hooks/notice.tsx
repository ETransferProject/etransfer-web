import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { CheckNoticeIcon, CloseMedium } from 'assets/images';
import clsx from 'clsx';
import { useState } from 'react';
import { BusinessType } from 'types/api';
import { formatSymbolDisplay } from 'utils/format';

const enum TTxnStatus {
  Success = 'Success',
  Fail = 'Fail',
}

export function useTxnNotice() {
  const [status, setStatus] = useState<TTxnStatus>();
  const [type, setType] = useState<BusinessType>();
  const [info, setInfo] = useState({ unit: '', amount: '' });

  const openNotification = (props?: ArgsProps) => {
    if (!type || !status || !info.amount || !info.unit) return;
    notification.info({
      ...props,
      className: clsx(
        'etransfer-txn-notification',
        status === TTxnStatus.Success
          ? 'etransfer-txn-notification-success'
          : 'etransfer-txn-notification-error',
      ),
      icon: <CheckNoticeIcon />,
      message: `${type === BusinessType.Withdraw ? 'Withdrawal' : type} ${status}`,
      closeIcon: <CloseMedium />,
      description:
        status === TTxnStatus.Success
          ? `The ${type === BusinessType.Withdraw ? 'withdrawal' : type.toLowerCase()} of ${
              info.amount
            } ${formatSymbolDisplay(info.unit)} has been received.`
          : `The ${type === BusinessType.Withdraw ? 'withdrawal' : type.toLowerCase()} of ${
              info.amount
            } ${formatSymbolDisplay(
              info.unit,
            )} failed; please check the transaction and contact customer service.`,
      placement: 'top',
      duration: props?.duration || 3,
    });
  };

  // myEvents.GlobalTxnNotice.emit()
  return { status, type, info, openNotification };
}
