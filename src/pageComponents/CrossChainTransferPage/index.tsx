import { useEffectOnce } from 'react-use';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import {
  useAppDispatch,
  useCommonState,
  useCrossChainTransfer,
  useLoading,
} from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import WebCrossChainTransfer from './WebCrossChainTransfer';
import MobileCrossChainTransfer from './MobileCrossChainTransfer';
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
  InitialCrossChainTransferState,
  setFromNetwork,
  setFromNetworkList,
  setFromWalletType,
  setRecipientAddress,
  setTokenChainRelation,
  setTokenList,
  setTokenSymbol,
  setToNetwork,
  setToNetworkList,
  setTotalNetworkList,
  setTotalTokenList,
  setToWalletType,
} from 'store/reducers/crossChainTransfer/slice';
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
import { useWallet } from 'context/Wallet';
import {
  TRANSFER_FORM_VALIDATE_DATA,
  TransferFormKeys,
  TransferValidateStatus,
  TTransferFormValues,
} from './types';
import { isDIDAddressSuffix } from 'utils/aelf/aelfBase';
import {
  computeFromNetworkList,
  computeTokenList,
  computeToNetworkList,
  getAelfMaxBalance,
} from './utils';
import { getTokenPrices } from 'utils/api/user';
import BigNumber from 'bignumber.js';
import { computeWalletType, getWalletSourceType, isAelfChain, isTONChain } from 'utils/wallet';
import { useUpdateBalance } from 'hooks/wallet/useUpdateBalance';
import { useGetAuthTokenFromStorage } from 'hooks/wallet/authToken';
import { CommonErrorNameType } from 'api/types';
import { BlockchainNetworkType } from 'constants/network';
import { isHtmlError } from 'utils/api/error';
import { formatSymbolDisplay } from 'utils/format';

export default function CrossChainTransferPage() {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();
  const { setLoading } = useLoading();
  const [{ fromWallet, toWallet }] = useWallet();
  const {
    fromWalletType,
    fromNetwork,
    toNetwork,
    tokenSymbol,
    totalTokenList,
    tokenChainRelation,
  } = useCrossChainTransfer();
  const fromNetworkRef = useRef<TNetworkItem | undefined>(fromNetwork);
  const toNetworkRef = useRef<TNetworkItem | undefined>(toNetwork);
  const tokenChainRelationRef = useRef<TGetTokenNetworkRelationResult | undefined>(
    tokenChainRelation,
  );
  const tokenSymbolRef = useRef(tokenSymbol);
  const totalTokenListRef = useRef<TTokenItem[]>([]);
  const [form] = Form.useForm<TTransferFormValues>();
  const [formValidateData, setFormValidateData] = useState<{
    [key in TransferFormKeys]: { validateStatus: TransferValidateStatus; errorMessage: string };
  }>(JSON.parse(JSON.stringify(TRANSFER_FORM_VALIDATE_DATA)));
  const [transferInfo, setTransferInfo] = useState<TCrossChainTransferInfo>(
    InitialCrossChainTransferInfo,
  );
  const transferInfoRef = useRef(InitialCrossChainTransferInfo);
  const [isTransactionFeeLoading, setIsTransactionFeeLoading] = useState(false);
  const [isUseRecipientAddress, setIsUseRecipientAddress] = useState(false);
  const isUseRecipientAddressRef = useRef(isUseRecipientAddress);
  const [recipientAddressInput, setRecipientAddressInput] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [amount, setAmount] = useState('');
  const amountRef = useRef('');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountPriceUsd, setAmountPriceUSD] = useState<number>(0);
  const { balance, decimalsFromWallet, getBalance, getBalanceInterval, resetBalance } =
    useUpdateBalance(tokenSymbol, totalTokenList, fromWallet);
  const resetBalanceRef = useRef(resetBalance);
  resetBalanceRef.current = resetBalance;
  const getAuthTokenFromStorage = useGetAuthTokenFromStorage(fromWallet);

  const minAmount = useMemo(() => {
    return transferInfo?.minAmount || '0.2';
  }, [transferInfo?.minAmount]);

  const receiveAmount = useMemo(() => {
    let result = '';
    const _fromAddress = fromWallet?.account;
    const _toAddress = isUseRecipientAddress ? recipientAddressInput : toWallet?.account;
    const _recipientAddressError =
      isUseRecipientAddress &&
      formValidateData[TransferFormKeys.RECIPIENT].validateStatus === TransferValidateStatus.Error;

    if (
      _recipientAddressError ||
      !amount ||
      !_fromAddress ||
      !_toAddress ||
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
    isUseRecipientAddress,
    recipientAddressInput,
    toNetwork,
    toWallet?.account,
    tokenSymbol,
    transferInfo.receiveAmount,
    transferInfo.transactionFee,
  ]);

  const currentToken = useMemo(() => {
    const item = totalTokenList?.find((item) => item.symbol === tokenSymbol);
    return item?.symbol ? item : InitialCrossChainTransferState.tokenList[0];
  }, [tokenSymbol, totalTokenList]);
  const currentTokenRef = useRef(currentToken);

  const getRecipientAddressInput = useCallback((): string => {
    return form.getFieldValue(TransferFormKeys.RECIPIENT)?.trim();
  }, [form]);

  const getCommentInput = useCallback(() => {
    return form.getFieldValue(TransferFormKeys.COMMENT)?.trim();
  }, [form]);

  const judgeIsSubmitDisabled = useCallback(
    (currentFormValidateData: typeof formValidateData) => {
      const isValueUndefined = (value: unknown) => value === undefined || value === '';
      const isDisabled =
        isValueUndefined(receiveAmount) ||
        currentFormValidateData[TransferFormKeys.RECIPIENT].validateStatus ===
          TransferValidateStatus.Error ||
        currentFormValidateData[TransferFormKeys.AMOUNT].validateStatus ===
          TransferValidateStatus.Error ||
        (isUseRecipientAddressRef.current && isValueUndefined(getRecipientAddressInput())) ||
        isValueUndefined(form.getFieldValue(TransferFormKeys.AMOUNT));
      setIsSubmitDisabled(isDisabled);
    },
    [form, getRecipientAddressInput, receiveAmount],
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
      fromNetwork: searchParams.get('fromNetwork'),
      toNetwork: searchParams.get('toNetwork'),
      tokenSymbol: searchParams.get('tokenSymbol'),
    }),
    [searchParams],
  );

  const checkRecipientAddress = useCallback(
    (address: string) => {
      const isSolanaNetwork = toNetworkRef.current?.network === BlockchainNetworkType.Solana;
      const isAddressShorterThanUsual = address && address?.length >= 32 && address?.length <= 39;

      if (!address) {
        handleFormValidateDataChange({
          [TransferFormKeys.RECIPIENT]: {
            validateStatus: TransferValidateStatus.Normal,
            errorMessage: '',
          },
        });
        return true;
      } else if (isSolanaNetwork && isAddressShorterThanUsual) {
        // Only the Solana network has this warning
        handleFormValidateDataChange({
          [TransferFormKeys.RECIPIENT]: {
            validateStatus: TransferValidateStatus.Warning,
            errorMessage: ADDRESS_SHORTER_THAN_USUAL,
          },
        });
        return false;
      } else if (address.length < 32 || address.length > 59) {
        handleFormValidateDataChange({
          [TransferFormKeys.RECIPIENT]: {
            validateStatus: TransferValidateStatus.Error,
            errorMessage: ADDRESS_NOT_CORRECT,
          },
        });
        return false;
      }

      if (isDIDAddressSuffix(address)) {
        form.setFieldValue(TransferFormKeys.RECIPIENT, removeELFAddressSuffix(address));
      }

      handleFormValidateDataChange({
        [TransferFormKeys.RECIPIENT]: {
          validateStatus: TransferValidateStatus.Normal,
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
        const _symbol = tokenSymbolRef.current || tokenSymbol;
        const _fromNetworkKey = fromNetworkRef.current?.network;
        const _toNetworkKey = toNetworkRef.current?.network;
        if (!_fromNetworkKey) return;

        setIsTransactionFeeLoading(true);
        const params: TGetTransferInfoRequest = {
          fromNetwork: _fromNetworkKey,
          toNetwork: _toNetworkKey,
          symbol: _symbol,
        };

        // set amount into api params
        if (amount) params.amount = amount;

        // Check from wallet type is reasonable.
        if (computeWalletType(_fromNetworkKey) === fromWallet?.walletType) {
          params.sourceType = getWalletSourceType(fromWallet?.walletType);
          if (fromWallet?.account) params.fromAddress = fromWallet?.account;
        }

        // Used to check whether the recipient address is reasonable.
        const _toAddress = isUseRecipientAddressRef.current ? getRecipientAddressInput() : '';
        if (_toAddress && checkRecipientAddress(_toAddress)) params.toAddress = _toAddress;

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

        const tokenItem = totalTokenList.find((item) => item.symbol === _symbol);
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
          limitCurrency: formatSymbolDisplay(tokenSymbolRef.current),
          transactionUnit: formatSymbolDisplay(tokenSymbolRef.current),
        });
        setIsTransactionFeeLoading(false);

        if (SEND_TRANSFER_ADDRESS_ERROR_CODE_LIST.includes(error?.code)) {
          handleFormValidateDataChange({
            [TransferFormKeys.RECIPIENT]: {
              validateStatus: TransferValidateStatus.Error,
              errorMessage: error?.message,
            },
          });
        } else {
          if (error.name !== CommonErrorNameType.CANCEL) {
            handleFormValidateDataChange({
              [TransferFormKeys.RECIPIENT]: {
                validateStatus: TransferValidateStatus.Normal,
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
      checkRecipientAddress,
      fromWallet?.account,
      fromWallet?.walletType,
      getBalance,
      getBalanceInterval,
      getCommentInput,
      getRecipientAddressInput,
      handleFormValidateDataChange,
      tokenSymbol,
      totalTokenList,
    ],
  );
  const getTransferDataRef = useRef(getTransferData);
  getTransferDataRef.current = getTransferData;

  const getTokenData = useCallback(
    async (isInitCurrentSymbol?: boolean) => {
      try {
        if (!fromNetworkRef.current || !toNetworkRef.current) return;
        const allowTokenList = computeTokenList({
          fromNetwork: fromNetworkRef.current,
          toNetwork: toNetworkRef.current,
          totalTokenList: totalTokenListRef.current,
          tokenChainRelation: tokenChainRelationRef.current,
        });
        dispatch(setTokenList(allowTokenList));

        if (isInitCurrentSymbol && !tokenSymbol) {
          dispatch(setTokenSymbol(allowTokenList[0].symbol));
          currentTokenRef.current = allowTokenList[0];
        } else {
          const exitToken = allowTokenList.find(
            (item) => item.symbol === (routeQuery.tokenSymbol || tokenSymbol),
          );
          if (exitToken) {
            // Restore the token from cache
            dispatch(setTokenSymbol(exitToken.symbol));
            currentTokenRef.current = exitToken;
          } else {
            // Set up first token info
            dispatch(setTokenSymbol(allowTokenList[0].symbol));
            currentTokenRef.current = allowTokenList[0];
          }
        }

        // to get minAmount and contractAddress
        tokenSymbolRef.current = currentTokenRef.current.symbol;
        await getTransferDataRef.current('');
      } catch (error) {
        console.log('getTokenData error', error);
        // SingleMessage.error(handleErrorMessage(error));
      }
    },
    [dispatch, routeQuery.tokenSymbol, tokenSymbol],
  );

  const getNetworkData = useCallback(async () => {
    try {
      const authToken = await getAuthTokenFromStorage(fromWalletType);
      const { networkList } = await getTransferNetworkList(
        { type: BusinessType.Transfer },
        authToken,
      );
      const _networkList = computeFromNetworkList(networkList);
      dispatch(setTotalNetworkList(_networkList));
      dispatch(setFromNetworkList(_networkList));

      if (_networkList?.length > 0) {
        // from logic
        const exitFromNetwork = _networkList.find(
          (item) => item.network === (routeQuery.fromNetwork || fromNetwork?.network),
        );
        if (exitFromNetwork && exitFromNetwork.status !== NetworkStatus.Offline) {
          // Restore the network from cache
          dispatch(setFromNetwork(exitFromNetwork));
          fromNetworkRef.current = exitFromNetwork;
        } else {
          // Set up the first healthy network
          const _healthNetwork = _networkList?.find(
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

        // to logic
        const toNetworkList = computeToNetworkList(
          fromNetworkRef.current,
          _networkList,
          totalTokenListRef.current,
          tokenChainRelationRef.current,
        );
        console.log('computeToNetworkList toNetworkList', toNetworkList);
        dispatch(setToNetworkList(toNetworkList));

        const exitToNetwork = toNetworkList.find(
          (item) => item.network === (routeQuery.toNetwork || toNetwork?.network),
        );
        if (exitToNetwork && exitToNetwork.status !== NetworkStatus.Offline) {
          // Restore the network from cache
          dispatch(setToNetwork(exitToNetwork));
          toNetworkRef.current = exitToNetwork;
        } else {
          // Set up the first healthy network
          const _healthNetwork = toNetworkList?.find(
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
      }
    } catch (error: any) {
      console.log('getNetworkData error', error);
    }
  }, [
    dispatch,
    fromNetwork?.network,
    fromWalletType,
    getAuthTokenFromStorage,
    routeQuery.fromNetwork,
    routeQuery.toNetwork,
    toNetwork?.network,
  ]);

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

  const handleRecipientAddressChange = useCallback(
    (value: string | null) => {
      dispatch(setRecipientAddress(value || ''));

      setRecipientAddressInput(value || '');
    },
    [dispatch],
  );

  const handleRecipientAddressBlur = useCallback(async () => {
    const addressInput = getRecipientAddressInput();

    try {
      if (checkRecipientAddress(addressInput)) {
        await getTransferDataRef.current(amountRef.current);
      }
    } catch (error) {
      console.log('handleRecipientAddressBlur error', error);
    }
  }, [checkRecipientAddress, getRecipientAddressInput]);

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
            [TransferFormKeys.AMOUNT]: {
              validateStatus: TransferValidateStatus.Error,
              errorMessage: '',
            },
          });
        } else {
          handleFormValidateDataChange({
            [TransferFormKeys.AMOUNT]: {
              validateStatus: TransferValidateStatus.Error,
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
          [TransferFormKeys.AMOUNT]: {
            validateStatus: TransferValidateStatus.Error,
            errorMessage: '',
          },
        });
      } else {
        handleFormValidateDataChange({
          [TransferFormKeys.AMOUNT]: {
            validateStatus: TransferValidateStatus.Normal,
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
          [TransferFormKeys.AMOUNT]: {
            validateStatus: TransferValidateStatus.Error,
            errorMessage: '',
          },
        });
      } else {
        handleFormValidateDataChange({
          [TransferFormKeys.AMOUNT]: {
            validateStatus: TransferValidateStatus.Normal,
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

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(value);
      amountRef.current = value;

      const _amountUsd = BigNumber(amountPriceUsd)
        .times(BigNumber(Number(value)))
        .toFixed(2);

      setAmountUSD(_amountUsd);
    },
    [amountPriceUsd],
  );

  useEffect(() => {
    if (!fromWallet?.isConnected) {
      form.setFieldValue(TransferFormKeys.AMOUNT, '');
      handleAmountChange('');
    }
  }, [fromWallet?.isConnected, handleAmountChange, form]);

  const resetRecipientAndComment = useCallback(() => {
    form.setFieldValue(TransferFormKeys.RECIPIENT, '');
    handleRecipientAddressChange('');
    handleFormValidateDataChange({
      [TransferFormKeys.RECIPIENT]: {
        validateStatus: TransferValidateStatus.Normal,
        errorMessage: '',
      },
    });

    form.setFieldValue(TransferFormKeys.COMMENT, '');
  }, [form, handleFormValidateDataChange, handleRecipientAddressChange]);

  const handleFromNetworkChanged = useCallback(
    async (item: TNetworkItem, toNetworkNew: TNetworkItem, newSymbol: string) => {
      try {
        fromNetworkRef.current = item;
        toNetworkRef.current = toNetworkNew;
        tokenSymbolRef.current = newSymbol;
        form.setFieldValue(TransferFormKeys.AMOUNT, '');
        handleAmountChange('');
        resetRecipientAndComment();

        // reset balance
        resetBalanceRef.current();

        await getTransferDataRef.current('');
      } catch (error) {
        console.log('handleFromNetworkChanged error', error);
      }
    },
    [form, handleAmountChange, resetRecipientAndComment],
  );

  const handleToNetworkChanged = useCallback(
    async (item: TNetworkItem, newSymbol: string) => {
      toNetworkRef.current = item;
      tokenSymbolRef.current = newSymbol;
      form.setFieldValue(TransferFormKeys.AMOUNT, '');
      handleAmountChange('');
      resetRecipientAndComment();

      await getTransferDataRef.current('');
    },
    [form, handleAmountChange, resetRecipientAndComment],
  );

  const handleTokenChanged = useCallback(
    async (item: TTokenItem) => {
      try {
        form.setFieldValue(TransferFormKeys.AMOUNT, '');
        handleAmountChange('');

        // reset balance
        resetBalanceRef.current();

        currentTokenRef.current = item;
        tokenSymbolRef.current = item.symbol;
        await getTransferDataRef.current('');
      } catch (error) {
        console.log('handleFromNetworkChanged error', error);
      }
    },
    [form, handleAmountChange],
  );

  const getAmountUSD = useCallback(async () => {
    const res = await getTokenPrices({
      symbols: tokenSymbol,
    });

    setAmountPriceUSD(res.items[0].priceUsd);
  }, [tokenSymbol]);

  const handleAmountBlur = useCallback(async () => {
    try {
      await getTransferDataRef.current(amountRef.current);

      // update amount usd display
      setAmountUSD(BigNumber(transferInfoRef.current.amountUsd || '').toFixed(2));

      // update usd price
      getAmountUSD();
    } catch (error) {
      console.log('handleAmountBlur error', error);
    }
  }, [getAmountUSD]);

  const handleClickMax = useCallback(async () => {
    if (isAelfChain(fromNetwork?.network || '') && tokenSymbol === 'ELF') {
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

        form.setFieldValue(TransferFormKeys.AMOUNT, _maxInput);
        handleAmountChange(_maxInput);
        await getTransferDataRef.current(_maxInput);
      } catch (error) {
        console.log('handleClickMax error', error);
        // SingleMessage.error(handleErrorMessage(error));
      } finally {
        setLoading(false);
      }
    } else {
      form.setFieldValue(TransferFormKeys.AMOUNT, balance);
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

  const handleUseRecipientChanged = useCallback(
    (isUse: boolean) => {
      setIsUseRecipientAddress(isUse);
      isUseRecipientAddressRef.current = isUse;
      judgeIsSubmitDisabled(formValidateData);

      getTransferDataRef.current(amountRef.current);
    },
    [formValidateData, judgeIsSubmitDisabled],
  );

  const handleClickFailedOk = useCallback(() => {
    form.setFieldValue(TransferFormKeys.AMOUNT, '');
    handleAmountChange('');
    getTransferDataRef.current('');
  }, [form, handleAmountChange]);
  const handleClickSuccessOk = useCallback(() => {
    form.setFieldValue(TransferFormKeys.AMOUNT, '');
    handleAmountChange('');
    getTransferDataRef.current('');
  }, [form, handleAmountChange]);

  const router = useRouter();
  const handleClickProcessingTip = useCallback(() => {
    router.push('/history');
  }, [router]);

  const getTotalTokenList = useCallback(async () => {
    try {
      const res = await getTokenList({
        type: BusinessType.Transfer,
      });

      dispatch(setTotalTokenList(res.tokenList));
      totalTokenListRef.current = res.tokenList;
    } catch (error) {
      console.log('getTotalTokenList error', error);
    }
  }, [dispatch]);

  const init = useCallback(async () => {
    await getTotalTokenList();
    await getTokenChainRelation();
    await getNetworkData();
    await getTokenData();
    getAmountUSD();

    getBalanceInterval(
      transferInfoRef.current?.contractAddress || '',
      fromNetworkRef.current?.network || '',
      currentTokenRef.current,
    );
  }, [
    getAmountUSD,
    getBalanceInterval,
    getNetworkData,
    getTokenChainRelation,
    getTokenData,
    getTotalTokenList,
  ]);
  const initRef = useRef(init);
  initRef.current = init;

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.CrossChainTransfer));
  });

  useEffect(() => {
    initRef.current();
    router.replace('/cross-chain-transfer');
  }, [router]);

  useEffect(() => {
    if (!fromWallet?.isConnected) {
      // reset balance
      resetBalanceRef.current();

      setFormValidateData(JSON.parse(JSON.stringify(TRANSFER_FORM_VALIDATE_DATA)));
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
    }, 10000);
    return () => {
      if (getTransactionFeeTimerRef.current) {
        clearInterval(getTransactionFeeTimerRef.current);
      }
    };
  }, [transferInfo.expiredTimestamp, getTransferData, amount]);

  // If fromWallet.account changed, update transferInfo data.
  useEffect(() => {
    if (fromWallet?.account) {
      getTransferDataRef.current(amountRef.current);
    }
  }, [fromWallet?.account]);

  return isPadPX ? (
    <MobileCrossChainTransfer
      receiveAmount={receiveAmount}
      form={form}
      formValidateData={formValidateData}
      transferInfo={transferInfo}
      minAmount={minAmount}
      amount={amount}
      amountUSD={amountUSD}
      balance={balance}
      decimalsFromWallet={decimalsFromWallet}
      isSubmitDisabled={isSubmitDisabled}
      isTransactionFeeLoading={isTransactionFeeLoading}
      isUseRecipientAddress={isUseRecipientAddress}
      recipientAddress={recipientAddressInput}
      comment={getCommentInput()}
      onFromNetworkChanged={handleFromNetworkChanged}
      onToNetworkChanged={handleToNetworkChanged}
      onTokenChanged={handleTokenChanged}
      onAmountChange={handleAmountChange}
      onAmountBlur={handleAmountBlur}
      onClickMax={handleClickMax}
      onUseRecipientChanged={handleUseRecipientChanged}
      onRecipientAddressChange={handleRecipientAddressChange}
      onRecipientAddressBlur={handleRecipientAddressBlur}
      onClickProcessingTip={handleClickProcessingTip}
      clickFailedOk={handleClickFailedOk}
      clickSuccessOk={handleClickSuccessOk}
    />
  ) : (
    <WebCrossChainTransfer
      receiveAmount={receiveAmount}
      form={form}
      formValidateData={formValidateData}
      transferInfo={transferInfo}
      minAmount={minAmount}
      amount={amount}
      amountUSD={amountUSD}
      balance={balance}
      decimalsFromWallet={decimalsFromWallet}
      isSubmitDisabled={isSubmitDisabled}
      isTransactionFeeLoading={isTransactionFeeLoading}
      isUseRecipientAddress={isUseRecipientAddress}
      recipientAddress={recipientAddressInput}
      comment={getCommentInput()}
      onFromNetworkChanged={handleFromNetworkChanged}
      onToNetworkChanged={handleToNetworkChanged}
      onTokenChanged={handleTokenChanged}
      onAmountChange={handleAmountChange}
      onAmountBlur={handleAmountBlur}
      onClickMax={handleClickMax}
      onUseRecipientChanged={handleUseRecipientChanged}
      onRecipientAddressChange={handleRecipientAddressChange}
      onRecipientAddressBlur={handleRecipientAddressBlur}
      onClickProcessingTip={handleClickProcessingTip}
      clickFailedOk={handleClickFailedOk}
      clickSuccessOk={handleClickSuccessOk}
    />
  );
}
