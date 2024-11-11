import { Form } from 'antd';
import styles from './styles.module.scss';
import { TNetworkItem } from 'types/api';
import { CommentCheckTip } from 'constants/withdraw';
import { useEffect, useState } from 'react';
import { useWallet } from 'context/Wallet';

enum ValidateStatus {
  Error = 'error',
  Warning = 'warning',
  Normal = '',
}

enum FormKeys {
  FROM_NETWORK = 'fromNetwork',
  TO_NETWORK = 'toNetwork',
  TOKEN = 'token',
  AMOUNT = 'amount',
  RECIPIENT = 'recipient',
  COMMENT = 'comment',
}

type TFormValues = {
  [FormKeys.FROM_NETWORK]: string;
  [FormKeys.TO_NETWORK]: TNetworkItem; // TODO
  [FormKeys.TOKEN]: string;
  [FormKeys.AMOUNT]: string;
  [FormKeys.RECIPIENT]: string;
  [FormKeys.COMMENT]: string;
};

const FORM_VALIDATE_DATA = {
  [FormKeys.FROM_NETWORK]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
  [FormKeys.TO_NETWORK]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
  [FormKeys.TOKEN]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
  [FormKeys.AMOUNT]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
  [FormKeys.RECIPIENT]: { validateStatus: ValidateStatus.Warning, errorMessage: '' },
  [FormKeys.COMMENT]: { validateStatus: ValidateStatus.Warning, errorMessage: CommentCheckTip },
};

export default function CrossChainTransferForm() {
  const [{ fromWallet }] = useWallet();
  const [form] = Form.useForm<TFormValues>();
  const [formValidateData, setFormValidateData] = useState<{
    [key in FormKeys]: { validateStatus: ValidateStatus; errorMessage: string };
  }>(JSON.parse(JSON.stringify(FORM_VALIDATE_DATA)));

  useEffect(() => {
    if (!fromWallet?.isConnected) {
      setFormValidateData(JSON.parse(JSON.stringify(FORM_VALIDATE_DATA)));
    }
  }, [fromWallet?.isConnected]);

  return (
    <div className={styles['cross-chain-transfer-form']}>
      <Form className={styles['form-wrapper']} layout="vertical" requiredMark={false} form={form}>
        <div className={styles['form-item-wrapper']}>
          <Form.Item
            className={styles['form-item']}
            label="From Network"
            name={FormKeys.FROM_NETWORK}
            validateStatus={formValidateData[FormKeys.FROM_NETWORK].validateStatus}
            help={formValidateData[FormKeys.FROM_NETWORK].errorMessage}>
            {/* from network */}
          </Form.Item>
        </div>
        <div className={styles['form-item-wrapper']}>
          <Form.Item
            className={styles['form-item']}
            label="To Network"
            name={FormKeys.TO_NETWORK}
            validateStatus={formValidateData[FormKeys.TO_NETWORK].validateStatus}
            help={formValidateData[FormKeys.TO_NETWORK].errorMessage}>
            {/* to network */}
          </Form.Item>
        </div>
        <div className={styles['form-item-wrapper']}>
          <Form.Item
            className={styles['form-item']}
            label="Token"
            name={FormKeys.TOKEN}
            validateStatus={formValidateData[FormKeys.TOKEN].validateStatus}
            help={formValidateData[FormKeys.TOKEN].errorMessage}>
            {/* token */}
          </Form.Item>
        </div>
        <div className={styles['form-item-wrapper']}>
          <Form.Item
            className={styles['form-item']}
            label="Amount"
            name={FormKeys.AMOUNT}
            validateStatus={formValidateData[FormKeys.AMOUNT].validateStatus}
            help={formValidateData[FormKeys.AMOUNT].errorMessage}>
            {/* amount */}
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
