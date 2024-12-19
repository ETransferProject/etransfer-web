import { Checkbox, Form, FormInstance, Input, InputProps } from 'antd';
import styles from './styles.module.scss';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useWallet } from 'context/Wallet';
import { BlockchainNetworkType } from 'constants/network';
import { useAppDispatch, useCrossChainTransfer } from 'store/Provider/hooks';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { MEMO_REG } from 'utils/reg';
import {
  formatSymbolDisplay,
  formatWithCommas,
  parseWithCommas,
  parseWithStringCommas,
} from 'utils/format';
import { TelegramPlatform } from 'utils/telegram';
import { sleep } from '@etransfer/utils';
import { devices } from '@portkey/utils';
import {
  InitialCrossChainTransferState,
  setFromNetwork,
  setFromWalletType,
  setTokenList,
  setTokenSymbol,
  setToNetwork,
  setToNetworkList,
  setToWalletType,
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
import { computeWalletType } from 'utils/wallet';

export interface CrossChainTransferFormProps {
  form: FormInstance<TTransferFormValues>;
  formValidateData: TTransferFormValidateData;
  amountUSD?: string;
  minAmount: string;
  balance: string;
  transferInfo: Omit<TCrossChainTransferInfo, 'minAmount'>;
  // getTransferData: (symbol?: string, amount?: string) => Promise<TGetTransferInfoResult>;
  onFromNetworkChanged?: (
    fromNetwork: TNetworkItem,
    toNetwork: TNetworkItem,
    tokenSymbol: string,
  ) => Promise<void>;
  onToNetworkChanged?: (toNetwork: TNetworkItem, tokenSymbol: string) => Promise<void>;
  onTokenChanged?: (item: TTokenItem) => Promise<void>;
  onAmountChange: (value: string) => void;
  onAmountBlur: InputProps['onBlur'];
  onClickMax: () => void;
  onUseRecipientChanged: (item: boolean) => void;
  onRecipientAddressChange: (value: string) => void;
  onRecipientAddressBlur: InputProps['onBlur'];
}

export default function CrossChainTransferForm({
  form,
  formValidateData,
  amountUSD,
  minAmount,
  balance,
  transferInfo,
  onFromNetworkChanged,
  onToNetworkChanged,
  onTokenChanged,
  onAmountChange,
  onAmountBlur,
  onClickMax,
  onUseRecipientChanged,
  onRecipientAddressChange,
  onRecipientAddressBlur,
}: CrossChainTransferFormProps) {
  const isAndroid = devices.isMobile().android;
  const dispatch = useAppDispatch();
  const [{ fromWallet }] = useWallet();
  const {
    fromWalletType,
    fromNetwork,
    toWalletType,
    toNetwork,
    tokenSymbol,
    tokenList,
    totalNetworkList,
    totalTokenList,
    tokenChainRelation,
  } = useCrossChainTransfer();
  const fromWalletTypeRef = useRef(fromWalletType);
  fromWalletTypeRef.current = fromWalletType;
  const toWalletTypeRef = useRef(toWalletType);
  toWalletTypeRef.current = toWalletType;
  const fromNetworkRef = useRef(fromNetwork);
  fromNetworkRef.current = fromNetwork;
  const toNetworkRef = useRef(toNetwork);
  toNetworkRef.current = toNetwork;
  const [isInputAddress, setIsInputAddress] = useState(false);
  const [isShowSwap, setIsShowSwap] = useState(false);

  const currentToken = useMemo(() => {
    const item = tokenList?.find((item) => item.symbol === tokenSymbol);
    return item?.symbol ? item : InitialCrossChainTransferState.tokenList[0];
  }, [tokenList, tokenSymbol]);

  const currentTokenDecimal = useMemo(() => currentToken.decimals, [currentToken.decimals]);

  const onUseRecipientChange = useCallback(
    (e: CheckboxChangeEvent) => {
      setIsInputAddress(e.target.checked);
      onUseRecipientChanged?.(e.target.checked);
    },
    [onUseRecipientChanged],
  );

  const handleFromNetworkChange = useCallback(
    async (item: TNetworkItem, newToNetwork?: TNetworkItem) => {
      dispatch(setFromNetwork(item));
      fromNetworkRef.current = item;

      const _fromWalletType = computeWalletType(item.network);
      if (_fromWalletType) {
        dispatch(setFromWalletType(_fromWalletType));
      } else {
        dispatch(setFromWalletType(undefined));
      }

      // compute toNetwork
      if (!totalNetworkList) return;
      const toNetworkList = computeToNetworkList(
        item,
        totalNetworkList,
        totalTokenList,
        tokenChainRelation,
      );
      dispatch(setToNetworkList(toNetworkList));

      const _toNetwork = newToNetwork || toNetwork;
      const exitToNetwork = toNetworkList.find((item) => item.network === _toNetwork?.network);
      let toNetworkNew = _toNetwork;
      if (exitToNetwork && exitToNetwork.status !== NetworkStatus.Offline) {
        dispatch(setToNetwork(exitToNetwork));
        toNetworkNew = exitToNetwork;
      } else {
        dispatch(setToNetwork(toNetworkList[0]));
        toNetworkNew = toNetworkList[0];
      }
      toNetworkRef.current = toNetworkNew;

      // set to wallet logic
      const _toWalletType = computeWalletType(toNetworkNew.network);
      if (_toWalletType) {
        dispatch(setToWalletType(_toWalletType));
      } else {
        dispatch(setToWalletType(undefined));
      }

      // compute token
      const allowTokenList = computeTokenList({
        fromNetwork: item,
        toNetwork: toNetworkNew,
        totalTokenList,
        tokenChainRelation,
      });
      dispatch(setTokenList(allowTokenList));
      const exitToken = allowTokenList.find((item) => item.symbol === tokenSymbol);
      let _tokenNew;
      if (exitToken) {
        dispatch(setTokenSymbol(exitToken.symbol));
        _tokenNew = exitToken.symbol;
      } else {
        dispatch(setTokenSymbol(allowTokenList[0].symbol));
        _tokenNew = allowTokenList[0].symbol;
      }

      onFromNetworkChanged?.(item, toNetworkNew, _tokenNew);
    },
    [
      dispatch,
      onFromNetworkChanged,
      toNetwork,
      tokenChainRelation,
      tokenSymbol,
      totalNetworkList,
      totalTokenList,
    ],
  );

  const handleToNetworkChange = useCallback(
    async (item: TNetworkItem) => {
      dispatch(setToNetwork(item));
      toNetworkRef.current = item;

      // set to wallet logic
      const _toWalletType = computeWalletType(item.network);
      if (_toWalletType) {
        dispatch(setToWalletType(_toWalletType));
      } else {
        dispatch(setToWalletType(undefined));
      }

      // compute token
      const allowTokenList = computeTokenList({
        fromNetwork: fromNetworkRef.current,
        toNetwork: item,
        totalTokenList,
        tokenChainRelation,
      });
      dispatch(setTokenList(allowTokenList));
      const exitToken = allowTokenList.find((item) => item.symbol === tokenSymbol);
      let _tokenNew;
      if (exitToken) {
        dispatch(setTokenSymbol(exitToken.symbol));
        _tokenNew = exitToken.symbol;
      } else {
        dispatch(setTokenSymbol(allowTokenList[0].symbol));
        _tokenNew = allowTokenList[0].symbol;
      }

      onToNetworkChanged?.(item, _tokenNew);
    },
    [dispatch, onToNetworkChanged, tokenChainRelation, tokenSymbol, totalTokenList],
  );

  const handleSelectToken = useCallback(
    async (item: TTokenItem) => {
      dispatch(setTokenSymbol(item.symbol));

      await onTokenChanged?.(item);
    },
    [dispatch, onTokenChanged],
  );

  const handleMouseEnterSwapIcon = useCallback((event: any) => {
    event.stopPropagation();
    setIsShowSwap(true);
  }, []);

  const handleMouseLeaveSwapIcon = useCallback((event: any) => {
    event.stopPropagation();
    setIsShowSwap(false);
  }, []);

  const handleClickSwapIcon = useCallback(async () => {
    const _fromWalletType = fromWalletTypeRef.current;
    const _toWalletType = toWalletTypeRef.current;
    const _fromNetwork = fromNetworkRef.current;
    const _toNetwork = toNetworkRef.current;
    if (!_fromNetwork || !_toNetwork) return;

    dispatch(setFromWalletType(_toWalletType));
    dispatch(setToWalletType(_fromWalletType));
    dispatch(setFromNetwork(_toNetwork));
    dispatch(setToNetwork(_fromNetwork));

    // check toNetwork and token
    await handleFromNetworkChange(_toNetwork, _fromNetwork);
    // check toNetwork and token
    // await handleToNetworkChange(_fromNetwork);
  }, [dispatch, handleFromNetworkChange]);

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
          onMouseLeave={handleMouseLeaveSwapIcon}
          onClick={handleClickSwapIcon}>
          {isShowSwap ? <SwapHorizontal /> : <ArrowRight2 />}
        </div>
        <div className={styles['network-and-wallet-card-list']}>
          <NetworkAndWalletCard
            cardType="From"
            className={clsx('flex-1', styles['network-and-wallet-from'])}
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
              placeholder={fromWallet?.isConnected ? `Min: ${minAmount}` : '0.0'}
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
              onBlur={onAmountBlur}
            />
          </Form.Item>
          <TokenSelected
            symbol={tokenSymbol}
            icon={currentToken.icon}
            selectCallback={handleSelectToken}
          />
        </div>
        <div className={clsx('flex-row-center-between', styles['send-section-balance-row'])}>
          <div>{!amountUSD || amountUSD === DEFAULT_NULL_VALUE ? '' : `$${amountUSD}`}</div>
          <div className="flex-row-center gap-8">
            <div>
              <span>Balance:&nbsp;</span>
              <span>
                {fromWallet?.isConnected && balance !== '' && balance !== DEFAULT_NULL_VALUE
                  ? balance
                  : '0'}
                &nbsp;
              </span>
              <span>{formatSymbolDisplay(tokenSymbol)}</span>
            </div>
            {fromWallet?.isConnected && (
              <div className={styles['send-section-max']} onClick={onClickMax}>
                Max
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="ant-form-item-explain-error">
        {formValidateData[TransferFormKeys.AMOUNT].errorMessage}
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
            placeholder="Recipient address"
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
