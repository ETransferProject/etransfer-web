import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { CheckNoticeIcon, CloseMedium } from 'assets/images';
import { useState } from 'react';
import { BusinessType } from 'types/api';

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
      className: 'etransfer-txn-notification',
      icon: <CheckNoticeIcon />,
      message: `${type} ${status}`,
      closeIcon: <CloseMedium />,
      description:
        status === TTxnStatus.Success
          ? `The ${type} of ${info.amount} ${info.unit} has been received.`
          : `The ${type} of ${info.amount} ${info.unit} failed; please check the Txn and contact customer service.`,
      placement: 'top',
      duration: props?.duration || 5,
    });
  };

  // myEvents.GlobalTxnNotice.emit()
  return { status, type, info, openNotification };
}
