import BigNumber from 'bignumber.js';
import { useEffectOnce } from 'react-use';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import {
  useAppDispatch,
  useCommonState,
  useWithdrawNewState,
  useLoading,
} from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import WebWithdraw from './WebWithdraw';
import MobileWithdraw from './MobileWithdraw';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BusinessType,
  NetworkStatus,
  TCrossChainTransferInfo,
  TGetTokenNetworkRelationResult,
  TGetTransferInfoRequest,
  TNetworkItem,
  TTokenItem,
} from 'types/api';
import {
  getTransferNetworkList,
  getTokenList,
  getTransferInfo,
  getTokenNetworkRelation,
} from 'utils/api/transfer';
import {
  InitialWithdrawNewState,
  setFromNetwork,
  setFromNetworkList,
  setFromWalletType,
  setWithdrawAddress,
  setTokenChainRelation,
  setTokenList,
  setTokenSymbol,
  setToNetwork,
  setToNetworkList,
  setTotalNetworkList,
  setToWalletType,
} from 'store/reducers/withdrawNew/slice';
import { SingleMessage } from '@etransfer/ui-react';
import {
  handleErrorMessage,
  isAuthTokenError,
  isWriteOperationError,
  removeELFAddressSuffix,
  ZERO,
} from '@etransfer/utils';
import { Form } from 'antd';
import {
  ADDRESS_NOT_CORRECT,
  ADDRESS_SHORTER_THAN_USUAL,
  InitialCrossChainTransferInfo,
  NOT_ENOUGH_ELF_FEE,
  SEND_TRANSFER_ADDRESS_ERROR_CODE_LIST,
} from 'constants/crossChainTransfer';
import { useGetOneWallet } from 'hooks/wallet';
import {
  WITHDRAW_FORM_VALIDATE_DATA,
  WithdrawFormKeys,
  WithdrawValidateStatus,
  TWithdrawFormValues,
} from './types';
import { isDIDAddressSuffix } from 'utils/aelf/aelfBase';
import { computeFromNetworkList, computeToNetworkList } from './utils';
import { getAelfMaxBalance } from 'pageComponents/CrossChainTransferPage/utils';
import { computeWalletType, getWalletSourceType, isAelfChain, isTONChain } from 'utils/wallet';
import { useUpdateBalance } from 'hooks/wallet/useUpdateBalance';
import { useGetAuthTokenFromStorage } from 'hooks/wallet/authToken';
import { CommonErrorNameType } from 'api/types';
import { BlockchainNetworkType } from 'constants/network';
import { isHtmlError } from 'utils/api/error';
import { formatSymbolDisplay } from 'utils/format';

export default function WithdrawContent() {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();
  const { setLoading } = useLoading();
  const {
    fromWalletType,
    fromNetwork,
    toNetwork,
    tokenSymbol,
    tokenList,
    tokenChainRelation,
    totalNetworkList,
    withdrawAddress,
  } = useWithdrawNewState();
  const fromNetworkRef = useRef<TNetworkItem | undefined>(fromNetwork);
  const toNetworkRef = useRef<TNetworkItem | undefined>(toNetwork);
  const fromWallet = useGetOneWallet(fromNetwork?.network || '');
  const tokenChainRelationRef = useRef<TGetTokenNetworkRelationResult | undefined>(
    tokenChainRelation,
  );
  const tokenListRef = useRef<TTokenItem[]>([]);
  const [form] = Form.useForm<TWithdrawFormValues>();
  const [formValidateData, setFormValidateData] = useState<{
    [key in WithdrawFormKeys]: { validateStatus: WithdrawValidateStatus; errorMessage: string };
  }>(JSON.parse(JSON.stringify(WITHDRAW_FORM_VALIDATE_DATA)));
  const [transferInfo, setTransferInfo] = useState<TCrossChainTransferInfo>(
    InitialCrossChainTransferInfo,
  );
  const transferInfoRef = useRef(InitialCrossChainTransferInfo);
  const [isTransactionFeeLoading, setIsTransactionFeeLoading] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [amount, setAmount] = useState('');
  const amountRef = useRef('');
  const { balance, decimalsFromWallet, getBalance, getBalanceInterval, resetBalance } =
    useUpdateBalance(tokenSymbol, tokenList, fromWallet);
  const getAuthTokenFromStorage = useGetAuthTokenFromStorage(fromWallet);

  const minAmount = useMemo(() => {
    return transferInfo?.minAmount || '0.2';
  }, [transferInfo?.minAmount]);

  const receiveAmount = useMemo(() => {
    let result = '';
    const _toAddressError =
      formValidateData[WithdrawFormKeys.ADDRESS].validateStatus === WithdrawValidateStatus.Error;

    if (
      _toAddressError ||
      !amount ||
      !fromWallet?.account ||
      !withdrawAddress ||
      !fromNetwork?.network ||
      !toNetwork ||
      !tokenSymbol
    ) {
      result = '';
    } else {
      let _res = '';
      if (transferInfo.transactionFee) {
        const _resTemp = BigNumber(amount).minus(BigNumber(transferInfo.transactionFee));
        _res = _resTemp.lte(ZERO) ? '0' : _resTemp.toFixed();
      } else {
        _res = transferInfo.receiveAmount;
      }

      result = _res;
    }

    return result;
  }, [
    amount,
    formValidateData,
    fromNetwork?.network,
    fromWallet?.account,
    toNetwork,
    tokenSymbol,
    transferInfo.receiveAmount,
    transferInfo.transactionFee,
    withdrawAddress,
  ]);

  const currentToken = useMemo(() => {
    const item = tokenList?.find((item) => item.symbol === tokenSymbol);
    return item?.symbol ? item : InitialWithdrawNewState.tokenList[0];
  }, [tokenSymbol, tokenList]);
  const currentTokenRef = useRef(currentToken);

  const getWithdrawAddressInput = useCallback((): string => {
    return form.getFieldValue(WithdrawFormKeys.ADDRESS)?.trim();
  }, [form]);

  const getCommentInput = useCallback(() => {
    return form.getFieldValue(WithdrawFormKeys.COMMENT)?.trim();
  }, [form]);

  const judgeIsSubmitDisabled = useCallback(
    (currentFormValidateData: typeof formValidateData) => {
      const isValueUndefined = (value: unknown) => value === undefined || value === '';
      const isDisabled =
        isValueUndefined(receiveAmount) ||
        currentFormValidateData[WithdrawFormKeys.ADDRESS].validateStatus ===
          WithdrawValidateStatus.Error ||
        currentFormValidateData[WithdrawFormKeys.AMOUNT].validateStatus ===
          WithdrawValidateStatus.Error ||
        isValueUndefined(getWithdrawAddressInput()) ||
        isValueUndefined(form.getFieldValue(WithdrawFormKeys.AMOUNT));
      setIsSubmitDisabled(isDisabled);
    },
    [form, getWithdrawAddressInput, receiveAmount],
  );

  const handleFormValidateDataChange = useCallback(
    (updateFormValidateData: Partial<typeof formValidateData>) => {
      setFormValidateData((prev) => {
        const newFormValidateData = { ...prev, ...updateFormValidateData };
        judgeIsSubmitDisabled(newFormValidateData);
        return newFormValidateData;
      });
    },
    [judgeIsSubmitDisabled],
  );

  const searchParams = useSearchParams();
  const routeQuery = useMemo(
    () => ({
      tokenSymbol: searchParams.get('tokenSymbol'),
      fromNetwork: searchParams.get('fromNetwork') || searchParams.get('chainId'),
      toNetwork: searchParams.get('toNetwork'),
      withdrawAddress: searchParams.get('withdrawAddress'),
    }),
    [searchParams],
  );

  const getTotalTokenList = useCallback(
    async (isInitCurrentSymbol?: boolean) => {
      try {
        const res = await getTokenList({
          type: BusinessType.Transfer,
        });

        dispatch(setTokenList(res.tokenList));
        tokenListRef.current = res.tokenList;

        if (isInitCurrentSymbol && !tokenSymbol) {
          dispatch(setTokenSymbol(res.tokenList[0].symbol));
          currentTokenRef.current = res.tokenList[0];
        } else {
          const exitToken = res.tokenList.find(
            (item) => item.symbol === (routeQuery.tokenSymbol || tokenSymbol),
          );
          if (exitToken) {
            dispatch(setTokenSymbol(exitToken.symbol));
            currentTokenRef.current = exitToken;
          } else {
            dispatch(setTokenSymbol(res.tokenList[0].symbol));
            currentTokenRef.current = res.tokenList[0];
          }
        }
      } catch (error) {
        console.log('getTotalTokenList error', error);
      }
    },
    [dispatch, routeQuery.tokenSymbol, tokenSymbol],
  );

  const getTokenChainRelation = useCallback(async () => {
    try {
      const authToken = await getAuthTokenFromStorage(fromWalletType);
      const tokenChainRelation = await getTokenNetworkRelation({}, authToken);
      tokenChainRelationRef.current = tokenChainRelation;
      dispatch(setTokenChainRelation(tokenChainRelation));
    } catch (error) {
      console.log('getTokenChainRelation error', error);
    }
  }, [dispatch, fromWalletType, getAuthTokenFromStorage]);

  const checkWithdrawAddress = useCallback(
    (address: string) => {
      const isSolanaNetwork = toNetworkRef.current?.network === BlockchainNetworkType.Solana;
      const isAddressShorterThanUsual = address && address?.length >= 32 && address?.length <= 39;

      if (!address) {
        handleFormValidateDataChange({
          [WithdrawFormKeys.ADDRESS]: {
            validateStatus: WithdrawValidateStatus.Normal,
            errorMessage: '',
          },
        });
        return true;
      } else if (isSolanaNetwork && isAddressShorterThanUsual) {
        // Only the Solana network has this warning
        handleFormValidateDataChange({
          [WithdrawFormKeys.ADDRESS]: {
            validateStatus: WithdrawValidateStatus.Warning,
            errorMessage: ADDRESS_SHORTER_THAN_USUAL,
          },
        });
        return false;
      } else if (address.length < 32 || address.length > 59) {
        // Check address length
        handleFormValidateDataChange({
          [WithdrawFormKeys.ADDRESS]: {
            validateStatus: WithdrawValidateStatus.Error,
            errorMessage: ADDRESS_NOT_CORRECT,
          },
        });
        return false;
      }

      if (isDIDAddressSuffix(address)) {
        form.setFieldValue(WithdrawFormKeys.ADDRESS, removeELFAddressSuffix(address));
      }
      handleFormValidateDataChange({
        [WithdrawFormKeys.ADDRESS]: {
          validateStatus: WithdrawValidateStatus.Normal,
          errorMessage: '',
        },
      });

      return true;
    },
    [form, handleFormValidateDataChange],
  );

  const getTransferData = useCallback(
    async (amount?: string) => {
      try {
        const _symbol = currentTokenRef.current.symbol || tokenSymbol;
        const _fromNetworkKey = fromNetworkRef.current?.network;
        const _toNetworkKey = toNetworkRef.current?.network;
        if (!_fromNetworkKey) return;

        setIsTransactionFeeLoading(true);
        const params: TGetTransferInfoRequest = {
          fromNetwork: _fromNetworkKey,
          toNetwork: _toNetworkKey,
          symbol: _symbol,
        };

        // set toAddress into api params
        const _toAddress = getWithdrawAddressInput();
        if (_toAddress && checkWithdrawAddress(_toAddress)) {
          params.toAddress = _toAddress;
        }

        // set amount into api params
        if (amount) params.amount = amount;

        // Check from wallet type is reasonable.
        if (computeWalletType(_fromNetworkKey) === fromWallet?.walletType) {
          params.sourceType = getWalletSourceType(fromWallet?.walletType);
          if (fromWallet?.account) params.fromAddress = fromWallet?.account;
        }

        // set comment into api params
        const comment = getCommentInput();
        if (_toNetworkKey && isTONChain(_toNetworkKey) && comment) params.memo = comment;

        const res = await getTransferInfo(params);
        transferInfoRef.current = res.transferInfo;

        setTransferInfo({
          ...res.transferInfo,
          limitCurrency: formatSymbolDisplay(res.transferInfo.limitCurrency),
          transactionUnit: formatSymbolDisplay(res.transferInfo?.transactionUnit || ''),
        });
        setIsTransactionFeeLoading(false);

        const tokenItem = tokenList.find((item) => item.symbol === _symbol);
        resetBalance();
        getBalanceInterval(
          transferInfoRef.current?.contractAddress || '',
          _fromNetworkKey,
          tokenItem,
        );
        getBalance(
          true,
          transferInfoRef.current?.contractAddress || '',
          _fromNetworkKey,
          tokenItem,
        );
      } catch (error: any) {
        // when network error, transactionUnit should as the same with symbol
        setTransferInfo({
          ...InitialCrossChainTransferInfo,
          limitCurrency: formatSymbolDisplay(currentTokenRef.current.symbol),
          transactionUnit: formatSymbolDisplay(currentTokenRef.current.symbol),
        });
        setIsTransactionFeeLoading(false);

        if (SEND_TRANSFER_ADDRESS_ERROR_CODE_LIST.includes(error?.code)) {
          handleFormValidateDataChange({
            [WithdrawFormKeys.ADDRESS]: {
              validateStatus: WithdrawValidateStatus.Error,
              errorMessage: error?.message,
            },
          });
        } else {
          if (error.name !== CommonErrorNameType.CANCEL) {
            handleFormValidateDataChange({
              [WithdrawFormKeys.ADDRESS]: {
                validateStatus: WithdrawValidateStatus.Normal,
                errorMessage: '',
              },
            });
          }

          if (
            error.name !== CommonErrorNameType.CANCEL &&
            !isHtmlError(error?.code, handleErrorMessage(error)) &&
            !isWriteOperationError(error?.code, handleErrorMessage(error)) &&
            !isAuthTokenError(error)
          ) {
            SingleMessage.error(handleErrorMessage(error));
          }
        }
      }
    },
    [
      checkWithdrawAddress,
      fromWallet?.account,
      fromWallet?.walletType,
      getBalance,
      getBalanceInterval,
      getCommentInput,
      getWithdrawAddressInput,
      handleFormValidateDataChange,
      resetBalance,
      tokenList,
      tokenSymbol,
    ],
  );
  const getTransferDataRef = useRef(getTransferData);
  getTransferDataRef.current = getTransferData;

  const computeToNetwork = useCallback(
    async (networkList?: TNetworkItem[]) => {
      if (!networkList || !fromNetworkRef.current?.network) return;
      const _toNetworkKey = routeQuery.toNetwork || toNetworkRef.current?.network;

      const _toNetworkList = computeToNetworkList(
        fromNetworkRef.current,
        currentTokenRef.current.symbol,
        networkList,
        tokenChainRelationRef.current,
      );
      console.log('computeToNetworkList _toNetworkList', _toNetworkList);
      dispatch(setToNetworkList(_toNetworkList));

      const _exitToNetwork = _toNetworkList.find((item) => item.network === _toNetworkKey);
      if (_exitToNetwork && _exitToNetwork.status !== NetworkStatus.Offline) {
        // Restore the network from cache
        dispatch(setToNetwork(_exitToNetwork));
        toNetworkRef.current = _exitToNetwork;
      } else {
        // Set up the first healthy network
        const _healthNetwork = _toNetworkList?.find(
          (item) => item.status !== NetworkStatus.Offline,
        );
        dispatch(setToNetwork(_healthNetwork || ({ network: '', name: '' } as TNetworkItem)));
        toNetworkRef.current = _healthNetwork || ({ network: '', name: '' } as TNetworkItem);
      }

      // set to wallet logic
      const _toWalletType = computeWalletType(toNetworkRef.current.network);
      if (_toWalletType) {
        dispatch(setToWalletType(_toWalletType));
      } else {
        dispatch(setToWalletType(undefined));
      }

      // to get minAmount and contractAddress
      await getTransferDataRef.current('');
    },
    [dispatch, routeQuery.toNetwork],
  );

  const computeFromAndToNetwork = useCallback(
    async (networkList?: TNetworkItem[]) => {
      if (!networkList) return;
      const _fromNetworkKey = routeQuery.fromNetwork || fromNetworkRef.current?.network;

      // 1. from logic
      const _fromNetworkList = computeFromNetworkList(
        currentTokenRef.current.symbol,
        networkList,
        tokenChainRelationRef.current,
      );

      dispatch(setFromNetworkList(_fromNetworkList));

      if (_fromNetworkList?.length > 0) {
        const exitFromNetwork = _fromNetworkList.find((item) => item.network === _fromNetworkKey);
        if (exitFromNetwork && exitFromNetwork.status !== NetworkStatus.Offline) {
          // Restore the network from cache
          dispatch(setFromNetwork(exitFromNetwork));
          fromNetworkRef.current = exitFromNetwork;
        } else {
          // Set up the first healthy network
          const _healthNetwork = _fromNetworkList?.find(
            (item) => item.status !== NetworkStatus.Offline,
          );
          dispatch(setFromNetwork(_healthNetwork || ({ network: '', name: '' } as TNetworkItem)));
          fromNetworkRef.current = _healthNetwork || ({ network: '', name: '' } as TNetworkItem);
        }
        // set from wallet logic
        const _fromWalletType = computeWalletType(fromNetworkRef.current.network);
        if (_fromWalletType) {
          dispatch(setFromWalletType(_fromWalletType));
        } else {
          dispatch(setFromWalletType(undefined));
        }

        // 2. to logic
        await computeToNetwork(networkList);
      }
    },
    [computeToNetwork, dispatch, routeQuery.fromNetwork],
  );

  const getNetworkList = useCallback(async () => {
    try {
      const authToken = await getAuthTokenFromStorage(fromWalletType);
      const { networkList } = await getTransferNetworkList(
        { type: BusinessType.Transfer },
        authToken,
      );

      dispatch(setTotalNetworkList(networkList));

      await computeFromAndToNetwork(networkList);
    } catch (error: any) {
      console.log('getNetworkList error', error);
    }
  }, [computeFromAndToNetwork, dispatch, fromWalletType, getAuthTokenFromStorage]);

  const handleWithdrawAddressChange = useCallback(
    (value: string | null) => {
      dispatch(setWithdrawAddress(value || ''));
    },
    [dispatch],
  );

  const handleWithdrawAddressBlur = useCallback(async () => {
    const addressInput = getWithdrawAddressInput();

    try {
      if (checkWithdrawAddress(addressInput)) {
        await getTransferDataRef.current(amountRef.current);
      }
    } catch (error) {
      console.log('handleWithdrawAddressBlur error', error);
    }
  }, [checkWithdrawAddress, getWithdrawAddressInput]);

  const judgeAmountValidateStatus = useCallback(async () => {
    if (isAelfChain(fromNetwork?.network || '') && tokenSymbol === 'ELF') {
      const _maxBalance = await getAelfMaxBalance({
        balance,
        aelfFee: transferInfoRef.current?.aelfTransactionFee,
        fromNetwork: fromNetwork?.network,
        tokenSymbol,
        account: fromWallet?.account || '',
      });
      if (amount && _maxBalance && ZERO.plus(amount).gt(_maxBalance)) {
        if (ZERO.plus(amount).gt(balance)) {
          handleFormValidateDataChange({
            [WithdrawFormKeys.AMOUNT]: {
              validateStatus: WithdrawValidateStatus.Error,
              errorMessage: '',
            },
          });
        } else {
          handleFormValidateDataChange({
            [WithdrawFormKeys.AMOUNT]: {
              validateStatus: WithdrawValidateStatus.Error,
              errorMessage: NOT_ENOUGH_ELF_FEE,
            },
          });
        }
      } else if (
        amount &&
        ((minAmount && ZERO.plus(amount).lt(minAmount)) ||
          (transferInfo.remainingLimit && ZERO.plus(amount).gt(transferInfo.remainingLimit)))
      ) {
        handleFormValidateDataChange({
          [WithdrawFormKeys.AMOUNT]: {
            validateStatus: WithdrawValidateStatus.Error,
            errorMessage: '',
          },
        });
      } else {
        handleFormValidateDataChange({
          [WithdrawFormKeys.AMOUNT]: {
            validateStatus: WithdrawValidateStatus.Normal,
            errorMessage: '',
          },
        });
      }
    } else {
      if (
        amount &&
        ((balance && ZERO.plus(amount).gt(balance)) ||
          (minAmount && ZERO.plus(amount).lt(minAmount)) ||
          (transferInfo.remainingLimit && ZERO.plus(amount).gt(transferInfo.remainingLimit)))
      ) {
        handleFormValidateDataChange({
          [WithdrawFormKeys.AMOUNT]: {
            validateStatus: WithdrawValidateStatus.Error,
            errorMessage: '',
          },
        });
      } else {
        handleFormValidateDataChange({
          [WithdrawFormKeys.AMOUNT]: {
            validateStatus: WithdrawValidateStatus.Normal,
            errorMessage: '',
          },
        });
      }
    }
  }, [
    amount,
    balance,
    fromNetwork?.network,
    fromWallet?.account,
    handleFormValidateDataChange,
    minAmount,
    tokenSymbol,
    transferInfo.remainingLimit,
  ]);

  useEffect(() => {
    judgeAmountValidateStatus();
  }, [judgeAmountValidateStatus]);

  const handleAmountChange = useCallback((value: string) => {
    setAmount(value);
    amountRef.current = value;
  }, []);

  useEffect(() => {
    if (!fromWallet?.isConnected) {
      form.setFieldValue(WithdrawFormKeys.AMOUNT, '');
      handleAmountChange('');
    }
  }, [fromWallet?.isConnected, handleAmountChange, form]);

  const resetWithdrawAddressAndComment = useCallback(() => {
    form.setFieldValue(WithdrawFormKeys.ADDRESS, '');
    handleWithdrawAddressChange('');
    handleFormValidateDataChange({
      [WithdrawFormKeys.ADDRESS]: {
        validateStatus: WithdrawValidateStatus.Normal,
        errorMessage: '',
      },
    });

    form.setFieldValue(WithdrawFormKeys.COMMENT, '');
  }, [form, handleFormValidateDataChange, handleWithdrawAddressChange]);

  const handleTokenChanged = useCallback(
    async (item: TTokenItem) => {
      try {
        currentTokenRef.current = item;

        // reset form data
        form.setFieldValue(WithdrawFormKeys.AMOUNT, '');
        handleAmountChange('');
        resetWithdrawAddressAndComment();

        await computeFromAndToNetwork(totalNetworkList);
      } catch (error) {
        console.log('handleTokenChanged error', error);
      }
    },
    [
      computeFromAndToNetwork,
      form,
      handleAmountChange,
      resetWithdrawAddressAndComment,
      totalNetworkList,
    ],
  );

  const handleFromNetworkChanged = useCallback(
    async (item: TNetworkItem) => {
      try {
        fromNetworkRef.current = item;

        // reset form data
        form.setFieldValue(WithdrawFormKeys.AMOUNT, '');
        handleAmountChange('');
        resetWithdrawAddressAndComment();

        await computeFromAndToNetwork(totalNetworkList);
      } catch (error) {
        console.log('handleFromNetworkChanged error', error);
      }
    },
    [
      computeFromAndToNetwork,
      form,
      handleAmountChange,
      resetWithdrawAddressAndComment,
      totalNetworkList,
    ],
  );

  const handleToNetworkChanged = useCallback(
    async (item: TNetworkItem) => {
      toNetworkRef.current = item;

      // reset form data
      form.setFieldValue(WithdrawFormKeys.AMOUNT, '');
      handleAmountChange('');
      resetWithdrawAddressAndComment();

      await computeToNetwork(totalNetworkList);
    },
    [computeToNetwork, form, handleAmountChange, resetWithdrawAddressAndComment, totalNetworkList],
  );

  const handleAmountBlur = useCallback(async () => {
    try {
      await getTransferDataRef.current(amountRef.current);
    } catch (error) {
      console.log('handleAmountBlur error', error);
    }
  }, []);

  const handleClickMax = useCallback(async () => {
    if (isAelfChain(fromNetwork?.network || '') && tokenSymbol === 'ELF') {
      // aelf chain and token=ELF, check aelf fee and approve fee
      try {
        setLoading(true);
        await getTransferDataRef.current(amountRef.current);
        const _maxInput = await getAelfMaxBalance({
          balance,
          aelfFee: transferInfoRef.current?.aelfTransactionFee,
          fromNetwork: fromNetwork?.network,
          tokenSymbol,
          account: fromWallet?.account || '',
        });

        form.setFieldValue(WithdrawFormKeys.AMOUNT, _maxInput);
        handleAmountChange(_maxInput);
        await getTransferDataRef.current(_maxInput);
      } catch (error) {
        console.log('handleClickMax error', error);
        // SingleMessage.error(handleErrorMessage(error));
      } finally {
        setLoading(false);
      }
    } else {
      form.setFieldValue(WithdrawFormKeys.AMOUNT, balance);
      handleAmountChange(balance);
      await getTransferDataRef.current(balance);
    }
  }, [
    balance,
    form,
    fromNetwork?.network,
    fromWallet?.account,
    handleAmountChange,
    setLoading,
    tokenSymbol,
  ]);

  const handleClickFailedOk = useCallback(() => {
    form.setFieldValue(WithdrawFormKeys.AMOUNT, '');
    handleAmountChange('');
    getTransferDataRef.current('');
  }, [form, handleAmountChange]);
  const handleClickSuccessOk = useCallback(() => {
    form.setFieldValue(WithdrawFormKeys.AMOUNT, '');
    handleAmountChange('');
    getTransferDataRef.current('');
  }, [form, handleAmountChange]);

  const router = useRouter();
  const handleClickProcessingTip = useCallback(() => {
    router.push('/history');
  }, [router]);

  const init = useCallback(async () => {
    // Initialization withdrawal address
    const _address = routeQuery.withdrawAddress || withdrawAddress || '';
    const _formatAddress = isDIDAddressSuffix(_address)
      ? removeELFAddressSuffix(_address)
      : _address;
    form.setFieldValue(WithdrawFormKeys.ADDRESS, _formatAddress);
    dispatch(setWithdrawAddress(_address));

    // Initialization api data
    await getTotalTokenList();
    await getTokenChainRelation();
    await getNetworkList();

    // Check address: It takes a while to take effect, so it is placed after the interface request.
    checkWithdrawAddress(_formatAddress);

    // Poll to obtain user token balance
    getBalanceInterval(
      transferInfoRef.current?.contractAddress || '',
      fromNetworkRef.current?.network || '',
      currentTokenRef.current,
    );
  }, [
    checkWithdrawAddress,
    dispatch,
    form,
    getBalanceInterval,
    getNetworkList,
    getTokenChainRelation,
    getTotalTokenList,
    routeQuery.withdrawAddress,
    withdrawAddress,
  ]);
  const initRef = useRef(init);
  initRef.current = init;

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.Withdraw));
  });

  useEffect(() => {
    initRef.current();
    router.replace('/withdraw');
  }, [router]);

  useEffect(() => {
    if (!fromWallet?.isConnected) {
      setFormValidateData(JSON.parse(JSON.stringify(WITHDRAW_FORM_VALIDATE_DATA)));
    }
  }, [fromWallet?.isConnected]);

  // interval update txn fee
  const getTransactionFeeTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!transferInfo.expiredTimestamp) {
      return;
    }
    if (getTransactionFeeTimerRef.current) {
      clearInterval(getTransactionFeeTimerRef.current);
    }
    getTransactionFeeTimerRef.current = setInterval(async () => {
      if (new Date().getTime() > transferInfo.expiredTimestamp && fromNetworkRef.current?.network) {
        await getTransferDataRef.current(amountRef.current);
      }
    }, 1000);
    return () => {
      if (getTransactionFeeTimerRef.current) {
        clearInterval(getTransactionFeeTimerRef.current);
      }
    };
  }, [transferInfo.expiredTimestamp, amount]);

  // If fromWallet.account changed, update transferInfo data.
  useEffect(() => {
    if (fromWallet?.account) {
      getTransferDataRef.current(amountRef.current);
    }
  }, [fromWallet?.account]);

  return isPadPX ? (
    <MobileWithdraw
      receiveAmount={receiveAmount}
      form={form}
      formValidateData={formValidateData}
      transferInfo={transferInfo}
      minAmount={minAmount}
      amount={amount}
      balance={balance}
      decimalsFromWallet={decimalsFromWallet}
      isSubmitDisabled={isSubmitDisabled}
      isTransactionFeeLoading={isTransactionFeeLoading}
      withdrawAddress={getWithdrawAddressInput()}
      comment={getCommentInput()}
      onFromNetworkChanged={handleFromNetworkChanged}
      onToNetworkChanged={handleToNetworkChanged}
      onTokenChanged={handleTokenChanged}
      onAmountChange={handleAmountChange}
      onAmountBlur={handleAmountBlur}
      onClickMax={handleClickMax}
      onWithdrawAddressChange={handleWithdrawAddressChange}
      onWithdrawAddressBlur={handleWithdrawAddressBlur}
      onClickProcessingTip={handleClickProcessingTip}
      clickFailedOk={handleClickFailedOk}
      clickSuccessOk={handleClickSuccessOk}
    />
  ) : (
    <WebWithdraw
      receiveAmount={receiveAmount}
      form={form}
      formValidateData={formValidateData}
      transferInfo={transferInfo}
      minAmount={minAmount}
      amount={amount}
      balance={balance}
      decimalsFromWallet={decimalsFromWallet}
      isSubmitDisabled={isSubmitDisabled}
      isTransactionFeeLoading={isTransactionFeeLoading}
      withdrawAddress={getWithdrawAddressInput()}
      comment={getCommentInput()}
      onFromNetworkChanged={handleFromNetworkChanged}
      onToNetworkChanged={handleToNetworkChanged}
      onTokenChanged={handleTokenChanged}
      onAmountChange={handleAmountChange}
      onAmountBlur={handleAmountBlur}
      onClickMax={handleClickMax}
      onWithdrawAddressChange={handleWithdrawAddressChange}
      onWithdrawAddressBlur={handleWithdrawAddressBlur}
      onClickProcessingTip={handleClickProcessingTip}
      clickFailedOk={handleClickFailedOk}
      clickSuccessOk={handleClickSuccessOk}
    />
  );
}
