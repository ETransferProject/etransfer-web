import { Form, FormInstance, Input, InputProps } from 'antd';
import styles from './styles.module.scss';
import { useCallback, useMemo } from 'react';
import { useGetOneWallet } from 'hooks/wallet';
import { BlockchainNetworkType } from 'constants/network';
import { useAppDispatch, useCommonState, useWithdrawNewState } from 'store/Provider/hooks';
import { MEMO_REG } from 'utils/reg';
import {
  formatSymbolDisplay,
  formatWithCommas,
  parseWithCommas,
  parseWithStringCommas,
} from 'utils/format';
import {
  InitialWithdrawNewState,
  setFromNetwork,
  setTokenSymbol,
  setToNetwork,
} from 'store/reducers/withdrawNew/slice';
import { TWithdrawFormValues, WithdrawFormKeys, TWithdrawFormValidateData } from '../types';
import { NetworkSelectedWrapper } from './NetworkSelectedWrapper';
import clsx from 'clsx';
import CommonSpace from 'components/CommonSpace';
import TokenSelectedWrapper from './TokenSelectedWrapper';
import { TCrossChainTransferInfo, TNetworkItem, TTokenItem } from 'types/api';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { handleInputFocus } from 'utils/common';
import RemainingLimit from 'pageComponents/CrossChainTransferPage/CrossChainTransferForm/RemainingLimit';
import CommentFormItemLabel from 'pageComponents/CrossChainTransferPage/CrossChainTransferForm/CommentFormItemLabel';
import FormAmountInput from './FormAmountInput';

export interface WithdrawFormProps {
  form: FormInstance<TWithdrawFormValues>;
  formValidateData: TWithdrawFormValidateData;
  minAmount: string;
  balance: string;
  transferInfo: Omit<TCrossChainTransferInfo, 'minAmount'>;
  onFromNetworkChanged?: (fromNetwork: TNetworkItem) => Promise<void>;
  onToNetworkChanged?: (toNetwork: TNetworkItem) => Promise<void>;
  onTokenChanged?: (item: TTokenItem) => Promise<void>;
  onAmountChange: (value: string) => void;
  onAmountBlur: InputProps['onBlur'];
  onClickMax: () => void;
  onWithdrawAddressChange: (value: string) => void;
  onWithdrawAddressBlur: InputProps['onBlur'];
}

export default function WithdrawForm({
  form,
  formValidateData,
  minAmount,
  balance,
  transferInfo,
  onFromNetworkChanged,
  onToNetworkChanged,
  onTokenChanged,
  onAmountChange,
  onAmountBlur,
  onClickMax,
  onWithdrawAddressChange,
  onWithdrawAddressBlur,
}: WithdrawFormProps) {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();
  const { fromNetwork, toNetwork, tokenSymbol, tokenList } = useWithdrawNewState();

  const fromWallet = useGetOneWallet(fromNetwork?.network || '');

  const isFromWalletConnected = useMemo(
    () => !!(fromWallet?.isConnected && fromWallet?.account),
    [fromWallet?.isConnected, fromWallet?.account],
  );

  const currentToken = useMemo(() => {
    const item = tokenList?.find((item) => item.symbol === tokenSymbol);
    return item?.symbol ? item : InitialWithdrawNewState.tokenList[0];
  }, [tokenList, tokenSymbol]);

  const currentTokenDecimal = useMemo(() => currentToken.decimals, [currentToken.decimals]);

  const handleSelectToken = useCallback(
    async (item: TTokenItem) => {
      dispatch(setTokenSymbol(item.symbol));

      await onTokenChanged?.(item);
    },
    [dispatch, onTokenChanged],
  );

  const handleFromNetworkChange = useCallback(
    async (item: TNetworkItem) => {
      dispatch(setFromNetwork(item));

      await onFromNetworkChanged?.(item);
    },
    [dispatch, onFromNetworkChanged],
  );

  const handleToNetworkChange = useCallback(
    async (item: TNetworkItem) => {
      dispatch(setToNetwork(item));

      await onToNetworkChanged?.(item);
    },
    [dispatch, onToNetworkChanged],
  );

  return (
    <Form className={styles['withdraw-body']} layout="vertical" requiredMark={false} form={form}>
      <div className={styles['token-section']}>
        <TokenSelectedWrapper
          label="Withdrawal Token"
          symbol={tokenSymbol}
          name={currentToken.name}
          icon={currentToken.icon}
          selectCallback={handleSelectToken}
        />
      </div>

      <CommonSpace direction={'vertical'} size={24} />

      <div className={styles['network-section']}>
        <NetworkSelectedWrapper
          cardType="From"
          className={'flex-1'}
          onSelectNetworkCallback={handleFromNetworkChange}
        />
        <NetworkSelectedWrapper
          cardType="To"
          className={'flex-1'}
          onSelectNetworkCallback={handleToNetworkChange}
        />
      </div>

      <Form.Item
        className={styles['form-item']}
        name={WithdrawFormKeys.ADDRESS}
        label="Withdrawal Address"
        validateStatus={formValidateData[WithdrawFormKeys.ADDRESS].validateStatus}
        help={formValidateData[WithdrawFormKeys.ADDRESS].errorMessage}>
        <Input
          className={styles['form-input']}
          placeholder="Enter an address"
          autoComplete="off"
          maxLength={100}
          onChange={(e) => onWithdrawAddressChange?.(e.target.value)}
          onBlur={onWithdrawAddressBlur}
        />
      </Form.Item>

      {toNetwork?.network === BlockchainNetworkType.TON && (
        <Form.Item
          className={styles['form-item']}
          label={<CommentFormItemLabel />}
          name={WithdrawFormKeys.COMMENT}
          validateStatus={formValidateData[WithdrawFormKeys.COMMENT].validateStatus}
          help={formValidateData[WithdrawFormKeys.COMMENT].errorMessage}>
          <Input
            className={styles['form-input']}
            placeholder="Enter comment"
            autoComplete="off"
            onInput={(event: any) => {
              const value = event.target?.value?.trim();
              const oldValue = form.getFieldValue(WithdrawFormKeys.COMMENT);

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
      )}

      <div className={styles['amount-section']}>
        <Form.Item
          className={styles['form-item']}
          label={
            <div className={clsx('flex-row-center-between', styles['form-label-wrapper'])}>
              <div className={clsx('flex-1', styles['form-label'])}>Withdrawal Amount</div>
              {!isPadPX && (
                <div className={styles['limit-section-web']}>
                  <RemainingLimit
                    isLabelLeft={false}
                    limitCurrency={transferInfo.limitCurrency}
                    totalLimit={transferInfo.totalLimit}
                    remainingLimit={transferInfo.remainingLimit}
                  />
                </div>
              )}
            </div>
          }
          name={WithdrawFormKeys.AMOUNT}
          validateStatus={formValidateData[WithdrawFormKeys.AMOUNT].validateStatus}
          help={formValidateData[WithdrawFormKeys.AMOUNT].errorMessage}>
          <FormAmountInput
            unit={transferInfo.transactionUnit}
            maxButtonConfig={
              isFromWalletConnected
                ? {
                    onClick: onClickMax,
                  }
                : undefined
            }
            autoComplete="off"
            placeholder={isFromWalletConnected ? `Minimum: ${minAmount}` : '0.0'}
            onInput={(event: any) => {
              const value = event.target?.value?.trim();
              const oldValue = form.getFieldValue(WithdrawFormKeys.AMOUNT);

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
            onFocus={() => handleInputFocus('inputAmountWrapper')}
            onChange={(event: any) => {
              const value = event.target?.value;
              const valueNotComma = parseWithCommas(value);
              onAmountChange(valueNotComma || '');
            }}
            onBlur={onAmountBlur}
          />
        </Form.Item>

        <div className={styles['user-balance']}>
          <span className={styles['user-balance-label']}>Balance</span>
          <span className={styles['user-balance-value']}>
            {fromWallet?.isConnected && balance !== '' && balance !== DEFAULT_NULL_VALUE
              ? balance
              : '0'}
            &nbsp;
          </span>
          <span>{formatSymbolDisplay(tokenSymbol)}</span>
        </div>
      </div>

      {isPadPX && (
        <div className={styles['limit-section']}>
          <RemainingLimit
            labelClassName={styles['limit-label']}
            valueClassName={styles['limit-value']}
            isLabelLeft={true}
            limitCurrency={transferInfo.limitCurrency}
            totalLimit={transferInfo.totalLimit}
            remainingLimit={transferInfo.remainingLimit}
          />
        </div>
      )}
    </Form>
  );
}
