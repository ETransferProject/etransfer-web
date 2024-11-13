import { Checkbox, Form, FormInstance, Input, InputProps } from 'antd';
import styles from './styles.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { useWallet } from 'context/Wallet';
import { BlockchainNetworkType } from 'constants/network';
import { useCrossChainTransfer } from 'store/Provider/hooks';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { MEMO_REG } from 'utils/reg';
import { formatWithCommas, parseWithCommas, parseWithStringCommas } from 'utils/format';
import { TelegramPlatform } from 'utils/telegram';
import { sleep } from '@etransfer/utils';
import { devices } from '@portkey/utils';
import { InitialCrossChainTransferState } from 'store/reducers/crossChainTransfer/slice';
import { TTransferFormValues, TransferFormKeys, TTransferFormValidateData } from '../types';

export interface CrossChainTransferFormProps {
  form: FormInstance<TTransferFormValues>;
  formValidateData: TTransferFormValidateData;
  minAmount: string;
  getTransferData: (symbol?: string, amount?: string) => Promise<void>;
  onAmountChange: (value: string) => void;
  onRecipientAddressChange: (value: string) => void;
  onRecipientAddressBlur: InputProps['onBlur'];
}

export default function CrossChainTransferForm({
  form,
  formValidateData,
  minAmount,
  getTransferData,
  onAmountChange,
  onRecipientAddressChange,
  onRecipientAddressBlur,
}: CrossChainTransferFormProps) {
  const isAndroid = devices.isMobile().android;
  const [{ fromWallet }] = useWallet();
  const { toNetwork, tokenSymbol, tokenList } = useCrossChainTransfer();
  const [isInputAddress, setIsInputAddress] = useState(false);

  const currentToken = useMemo(() => {
    const item = tokenList?.find((item) => item.symbol === tokenSymbol);
    return item?.symbol ? item : InitialCrossChainTransferState.tokenList[0];
  }, [tokenList, tokenSymbol]);

  // TODO get from wallet?
  const currentTokenDecimal = useMemo(() => currentToken.decimals, [currentToken.decimals]);

  const onUseRecipientChange = useCallback((e: CheckboxChangeEvent) => {
    setIsInputAddress(e.target.checked);
    console.log(`onUseRecipientChange = ${e.target.checked}`);
  }, []);

  return (
    <div className={styles['cross-chain-transfer-form']}>
      <Form className={styles['form-wrapper']} layout="vertical" requiredMark={false} form={form}>
        <div className={styles['form-item-wrapper']}>
          <Form.Item
            className={styles['form-item']}
            label="From Network"
            name={TransferFormKeys.FROM_NETWORK}
            validateStatus={formValidateData[TransferFormKeys.FROM_NETWORK].validateStatus}
            help={formValidateData[TransferFormKeys.FROM_NETWORK].errorMessage}>
            {/* from network */}
          </Form.Item>
        </div>
        <div className={styles['form-item-wrapper']}>
          <Form.Item
            className={styles['form-item']}
            label="To Network"
            name={TransferFormKeys.TO_NETWORK}
            validateStatus={formValidateData[TransferFormKeys.TO_NETWORK].validateStatus}
            help={formValidateData[TransferFormKeys.TO_NETWORK].errorMessage}>
            {/* to network */}
          </Form.Item>
        </div>
        <div className={styles['form-item-wrapper']}>
          <Form.Item
            className={styles['form-item']}
            label="Token"
            name={TransferFormKeys.TOKEN}
            validateStatus={formValidateData[TransferFormKeys.TOKEN].validateStatus}
            help={formValidateData[TransferFormKeys.TOKEN].errorMessage}>
            {/* token */}
          </Form.Item>
        </div>
        <div className={styles['form-item-wrapper']}>
          <Form.Item
            className={styles['form-item']}
            label="Amount"
            name={TransferFormKeys.AMOUNT}
            validateStatus={formValidateData[TransferFormKeys.AMOUNT].validateStatus}
            help={formValidateData[TransferFormKeys.AMOUNT].errorMessage}>
            <Input
              className={styles['transfer-input-amount']}
              // bordered={false}
              autoComplete="off"
              placeholder={fromWallet?.isConnected ? `Minimum: ${minAmount}` : ''}
              onInput={(event: any) => {
                const value = event.target?.value?.trim();
                const oldValue = form.getFieldValue(TransferFormKeys.AMOUNT);

                // CHECK1: not empty
                if (!value) return (event.target.value = '');

                // CHECK2: comma count
                const commaCount = value.match(/\./gim)?.length;
                if (commaCount > 1) {
                  return (event.target.value = oldValue);
                }

                // CHECK3: input number and decimal count
                const lastNumber = value.charAt(value.length - 1);
                const valueNotComma = parseWithStringCommas(value);
                const stringReg = `^[0-9]{1,9}((\\.\\d)|(\\.\\d{0,${currentTokenDecimal}}))?$`;
                const CheckNumberReg = new RegExp(stringReg);

                if (!CheckNumberReg.exec(valueNotComma)) {
                  if (lastNumber !== '.') {
                    return (event.target.value = oldValue);
                  }
                } else {
                  const beforePoint = formatWithCommas({ amount: valueNotComma });
                  const afterPoint = lastNumber === '.' ? '.' : '';
                  event.target.value = beforePoint + afterPoint;
                }
              }}
              onFocus={async () => {
                if (!TelegramPlatform.isTelegramPlatform() && isAndroid) {
                  // The keyboard does not block the input box
                  await sleep(200);
                  document.getElementById('inputAmountWrapper')?.scrollIntoView({
                    block: 'center',
                    behavior: 'smooth',
                  });
                }
              }}
              onChange={(event: any) => {
                const value = event.target?.value;
                const valueNotComma = parseWithCommas(value);
                onAmountChange(valueNotComma || '');
              }}
              onBlur={() => {
                // TODO
                // if (handleAmountValidate()) {
                getTransferData();
                // }
              }}
            />
          </Form.Item>
        </div>

        <Checkbox onChange={onUseRecipientChange}>Send to another address manually</Checkbox>
        {isInputAddress && (
          <div className={styles['form-item-wrapper']}>
            <Form.Item
              className={styles['form-item']}
              name={TransferFormKeys.RECIPIENT}
              validateStatus={formValidateData[TransferFormKeys.RECIPIENT].validateStatus}
              help={formValidateData[TransferFormKeys.RECIPIENT].errorMessage}>
              <Input
                placeholder="Recipient's aelf Address"
                autoComplete="off"
                onChange={(e) => onRecipientAddressChange?.(e.target.value)}
                onBlur={onRecipientAddressBlur}
              />
            </Form.Item>
          </div>
        )}

        {isInputAddress && toNetwork?.network === BlockchainNetworkType.TON && (
          <div className={styles['form-item-wrapper']}>
            <Form.Item
              className={styles['form-item']}
              label="Comment"
              name={TransferFormKeys.COMMENT}
              validateStatus={formValidateData[TransferFormKeys.COMMENT].validateStatus}
              help={formValidateData[TransferFormKeys.COMMENT].errorMessage}>
              <Input
                placeholder="Enter comment"
                autoComplete="off"
                onInput={(event: any) => {
                  const value = event.target?.value?.trim();
                  const oldValue = form.getFieldValue(TransferFormKeys.COMMENT);

                  // CHECK1: not empty
                  if (!value) return (event.target.value = '');

                  // CHECK2: memo reg
                  const CheckMemoReg = new RegExp(MEMO_REG);
                  if (!CheckMemoReg.exec(value)) {
                    event.target.value = oldValue;
                    return;
                  } else {
                    event.target.value = value;
                    return;
                  }
                }}
              />
            </Form.Item>
          </div>
        )}
      </Form>
    </div>
  );
}
