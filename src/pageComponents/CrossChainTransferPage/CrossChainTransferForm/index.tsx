import { Checkbox, Form, FormInstance, Input, InputProps } from 'antd';
import styles from './styles.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { useWallet } from 'context/Wallet';
import { BlockchainNetworkType } from 'constants/network';
import { useAppDispatch, useCrossChainTransfer } from 'store/Provider/hooks';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { MEMO_REG } from 'utils/reg';
import { formatWithCommas, parseWithCommas, parseWithStringCommas } from 'utils/format';
import { TelegramPlatform } from 'utils/telegram';
import { sleep } from '@etransfer/utils';
import { devices } from '@portkey/utils';
import {
  InitialCrossChainTransferState,
  setFromNetwork,
  setTokenList,
  setTokenSymbol,
  setToNetwork,
  setToNetworkList,
} from 'store/reducers/crossChainTransfer/slice';
import { TTransferFormValues, TransferFormKeys, TTransferFormValidateData } from '../types';
import { NetworkAndWalletCard } from './NetworkAndWalletCard';
import { ArrowRight2, QuestionMarkIcon, SwapHorizontal } from 'assets/images';
import clsx from 'clsx';
import CommonSpace from 'components/CommonSpace';
import TokenSelected from './TokenSelected';
import RemainingLimit from './RemainingLimit';
import { NetworkStatus, TCrossChainTransferInfo, TNetworkItem, TTokenItem } from 'types/api';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import CommonTooltip from 'components/CommonTooltip';
import { TRANSFER_SEND_RECIPIENT_TIP } from 'constants/crossChainTransfer';
import CommentFormItemLabel from './CommentFormItemLabel';
import { computeTokenList, computeToNetworkList } from '../utils';

export interface CrossChainTransferFormProps {
  form: FormInstance<TTransferFormValues>;
  formValidateData: TTransferFormValidateData;
  minAmount: string;
  balance: string;
  transferInfo: Omit<TCrossChainTransferInfo, 'minAmount'>;
  getTransferData: (symbol?: string, amount?: string) => Promise<void>;
  onAmountChange: (value: string) => void;
  onRecipientAddressChange: (value: string) => void;
  onRecipientAddressBlur: InputProps['onBlur'];
}

export default function CrossChainTransferForm({
  form,
  formValidateData,
  minAmount,
  balance,
  transferInfo,
  getTransferData,
  onAmountChange,
  onRecipientAddressChange,
  onRecipientAddressBlur,
}: CrossChainTransferFormProps) {
  const isAndroid = devices.isMobile().android;
  const dispatch = useAppDispatch();
  const [{ fromWallet }] = useWallet();
  const { toNetwork, tokenSymbol, tokenList, totalNetworkList, totalTokenList } =
    useCrossChainTransfer();
  const [isInputAddress, setIsInputAddress] = useState(false);
  const [isShowSwap, setIsShowSwap] = useState(false);

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

  const handleMouseEnterSwapIcon = useCallback((event: any) => {
    event.stopPropagation();
    setIsShowSwap(true);
  }, []);

  const handleMouseLeaveSwapIcon = useCallback((event: any) => {
    event.stopPropagation();
    setIsShowSwap(false);
  }, []);

  const handleFromNetworkChange = useCallback(
    async (item: TNetworkItem) => {
      dispatch(setFromNetwork(item));

      // compute toNetwork
      if (!totalNetworkList) return;
      const toNetworkList = computeToNetworkList(item, totalNetworkList, totalTokenList);
      dispatch(setToNetworkList(toNetworkList));

      const exitToNetwork = toNetworkList.find((item) => item.network === toNetwork?.network);
      let toNetworkNew = toNetwork;
      if (exitToNetwork && exitToNetwork.status !== NetworkStatus.Offline) {
        dispatch(setToNetwork(exitToNetwork));
        toNetworkNew = exitToNetwork;
      } else {
        dispatch(setToNetwork(toNetworkList[0]));
        toNetworkNew = toNetworkList[0];
      }

      // compute token
      const allowTokenList = computeTokenList(toNetworkNew, totalTokenList);
      dispatch(setTokenList(allowTokenList));
      const exitToken = totalTokenList.find((item) => item.symbol === tokenSymbol);
      if (exitToken) {
        dispatch(setTokenSymbol(exitToken.symbol));
      } else {
        dispatch(setTokenSymbol(allowTokenList[0].symbol));
      }
    },
    [dispatch, toNetwork, tokenSymbol, totalNetworkList, totalTokenList],
  );

  const handleToNetworkChange = useCallback(
    async (item: TNetworkItem) => {
      dispatch(setToNetwork(item));

      // compute token
      const allowTokenList = computeTokenList(item, totalTokenList);
      dispatch(setTokenList(allowTokenList));
      const exitToken = totalTokenList.find((item) => item.symbol === tokenSymbol);
      if (exitToken) {
        dispatch(setTokenSymbol(exitToken.symbol));
      } else {
        dispatch(setTokenSymbol(allowTokenList[0].symbol));
      }
    },
    [dispatch, tokenSymbol, totalTokenList],
  );

  const handleSelectToken = useCallback(
    (item: TTokenItem) => {
      dispatch(setTokenSymbol(item.symbol));
    },
    [dispatch],
  );

  return (
    <Form
      className={styles['cross-chain-transfer-body']}
      layout="vertical"
      requiredMark={false}
      form={form}>
      <div className={styles['network-and-wallet-section']}>
        <div
          className={clsx('flex-center', styles['cross-chain-transfer-swap-icon'])}
          onMouseEnter={handleMouseEnterSwapIcon}
          onMouseLeave={handleMouseLeaveSwapIcon}>
          {isShowSwap ? <SwapHorizontal /> : <ArrowRight2 />}
        </div>
        <div className={clsx('flex-row-center gap-4')}>
          <NetworkAndWalletCard
            cardType="From"
            className={'flex-1'}
            onSelectNetworkCallback={handleFromNetworkChange}
          />
          <NetworkAndWalletCard
            cardType="To"
            className={clsx('flex-1', styles['network-and-wallet-to'])}
            onSelectNetworkCallback={handleToNetworkChange}
          />
        </div>
      </div>
      <CommonSpace direction={'vertical'} size={12} />

      <div className={styles['send-section']}>
        <div className={styles['send-section-title']}>You Send</div>
        <div className={clsx('flex-row-center-between', styles['send-section-amount-row'])}>
          <Form.Item
            className={clsx('flex-row-center', styles['send-section-input-wrap'])}
            name={TransferFormKeys.AMOUNT}>
            <Input
              className={styles['send-section-input-amount']}
              bordered={false}
              autoComplete="off"
              placeholder={fromWallet?.isConnected ? `Minimum: ${minAmount}` : '0.0'}
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
          <TokenSelected
            symbol={tokenSymbol}
            icon={currentToken.icon}
            selectCallback={handleSelectToken}
          />
        </div>
        <div className={clsx('flex-row-center-between', styles['send-section-balance-row'])}>
          <div>
            {!transferInfo.receiveAmountUsd || transferInfo.receiveAmountUsd === DEFAULT_NULL_VALUE
              ? ''
              : `$${transferInfo.receiveAmountUsd}`}
          </div>
          <div className="flex-row-center gap-8">
            <div>
              <span>Balance:&nbsp;</span>
              <span>{balance}&nbsp;</span>
              <span>{tokenSymbol}</span>
            </div>
            <div className={styles['send-section-max']}>Max</div>
          </div>
        </div>
      </div>

      <CommonSpace direction={'vertical'} size={12} />

      <div className={styles['limit-section']}>
        <RemainingLimit
          limitCurrency={transferInfo.limitCurrency}
          totalLimit={transferInfo.totalLimit}
          remainingLimit={transferInfo.remainingLimit}
        />
      </div>
      <CommonSpace direction={'vertical'} size={24} />
      <div className={clsx('flex-row-center', styles['use-recipient-row'])}>
        <Checkbox className={styles['use-recipient-checkbox']} onChange={onUseRecipientChange} />
        <span className={styles['use-recipient-checkbox-text']}>
          Send to another address manually
        </span>
        <CommonTooltip
          className={clsx(styles['question-label'])}
          placement="top"
          title={TRANSFER_SEND_RECIPIENT_TIP}>
          <QuestionMarkIcon />
        </CommonTooltip>
      </div>
      {isInputAddress && (
        <Form.Item
          className={styles['recipient-address-form-item']}
          name={TransferFormKeys.RECIPIENT}
          validateStatus={formValidateData[TransferFormKeys.RECIPIENT].validateStatus}
          help={formValidateData[TransferFormKeys.RECIPIENT].errorMessage}>
          <Input
            className={styles['recipient-address-input']}
            placeholder="Recipient's aelf Address"
            autoComplete="off"
            onChange={(e) => onRecipientAddressChange?.(e.target.value)}
            onBlur={onRecipientAddressBlur}
          />
        </Form.Item>
      )}

      {isInputAddress && toNetwork?.network === BlockchainNetworkType.TON && (
        <Form.Item
          className={styles['comment-form-item']}
          label={<CommentFormItemLabel />}
          name={TransferFormKeys.COMMENT}
          validateStatus={formValidateData[TransferFormKeys.COMMENT].validateStatus}
          help={formValidateData[TransferFormKeys.COMMENT].errorMessage}>
          <Input
            className={styles['comment-input']}
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
      )}
    </Form>
  );
}
