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
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BusinessType,
  NetworkStatus,
  TCrossChainTransferInfo,
  TGetTransferInfoRequest,
  TNetworkItem,
  TTokenItem,
} from 'types/api';
import { getTransferNetworkList, getTokenList, getTransferInfo } from 'utils/api/transfer';
import {
  InitialCrossChainTransferState,
  setFromNetwork,
  setFromNetworkList,
  setFromWalletType,
  setRecipientAddress,
  setTokenList,
  setTokenSymbol,
  setToNetwork,
  setToNetworkList,
  setTotalNetworkList,
  setTotalTokenList,
  setToWalletType,
} from 'store/reducers/crossChainTransfer/slice';
import { formatSymbolDisplay } from '@etransfer/ui-react';
import { removeELFAddressSuffix, ZERO } from '@etransfer/utils';
import { Form } from 'antd';
import { InitialCrossChainTransferInfo } from 'constants/crossChainTransfer';
import { useWallet } from 'context/Wallet';
import {
  TRANSFER_FORM_VALIDATE_DATA,
  TransferFormKeys,
  TransferValidateStatus,
  TTransferFormValues,
} from './types';
import { isDIDAddressSuffix } from 'utils/aelf/aelfBase';
import { WalletTypeEnum } from 'context/Wallet/types';
import { computeTokenList, computeToNetworkList } from './utils';
import { getTokenPrices } from 'utils/api/user';
import BigNumber from 'bignumber.js';
import { computeWalletType, isAelfChain } from 'utils/wallet';
import { checkIsEnoughAllowance } from 'utils/contract';
import { APPROVE_ELF_FEE } from 'constants/withdraw';
import { SupportedELFChainId } from 'constants/index';
import { useUpdateBalance } from 'hooks/wallet/useUpdateBalance';
import { useGetAuthTokenFromStorage } from 'hooks/wallet/authToken';

export default function CrossChainTransferPage() {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();
  const { setLoading } = useLoading();
  const [{ fromWallet, toWallet }] = useWallet();
  const { fromWalletType, fromNetwork, toNetwork, tokenSymbol, totalTokenList } =
    useCrossChainTransfer();
  const fromNetworkRef = useRef<TNetworkItem>(fromNetwork);
  const toNetworkRef = useRef<TNetworkItem>(toNetwork);
  const totalTokenListRef = useRef<TTokenItem[]>([]);
  const [form] = Form.useForm<TTransferFormValues>();
  const [formValidateData, setFormValidateData] = useState<{
    [key in TransferFormKeys]: { validateStatus: TransferValidateStatus; errorMessage: string };
  }>(JSON.parse(JSON.stringify(TRANSFER_FORM_VALIDATE_DATA)));
  const [transferInfo, setTransferInfo] = useState<TCrossChainTransferInfo>(
    InitialCrossChainTransferInfo,
  );
  const transferInfoRef = useRef(InitialCrossChainTransferInfo);
  const [recipientAddressInput, setRecipientAddressInput] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [amount, setAmount] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountPriceUsd, setAmountPriceUSD] = useState<number>(0);
  const { setEVMTokenContractAddressRef, balance, getBalance, getBalanceInterval } =
    useUpdateBalance();
  const getAuthTokenFromStorage = useGetAuthTokenFromStorage();

  const minAmount = useMemo(() => {
    return transferInfo?.minAmount || '0.2';
  }, [transferInfo?.minAmount]);

  const receiveAmount = useMemo(() => {
    let result = '';
    if (!amount || ZERO.plus(amount).isLessThan(ZERO.plus(minAmount))) {
      result = '';
    } else {
      result = transferInfo.receiveAmount;
    }

    return result;
  }, [amount, minAmount, transferInfo.receiveAmount]);

  const currentToken = useMemo(() => {
    const item = totalTokenList?.find((item) => item.symbol === tokenSymbol);
    return item?.symbol ? item : InitialCrossChainTransferState.tokenList[0];
  }, [tokenSymbol, totalTokenList]);
  const currentTokenRef = useRef(currentToken);

  const getRecipientAddressInput = useCallback(() => {
    return form.getFieldValue(TransferFormKeys.RECIPIENT)?.trim();
  }, [form]);

  const getCommentInput = useCallback(() => {
    return form.getFieldValue(TransferFormKeys.COMMENT)?.trim();
  }, [form]);

  const judgeIsSubmitDisabled = useCallback(
    (currentFormValidateData: typeof formValidateData) => {
      const isValueUndefined = (value: unknown) => value === undefined || value === '';
      const isDisabled =
        currentFormValidateData[TransferFormKeys.RECIPIENT].validateStatus ===
          TransferValidateStatus.Error ||
        currentFormValidateData[TransferFormKeys.AMOUNT].validateStatus ===
          TransferValidateStatus.Error ||
        isValueUndefined(getRecipientAddressInput()) ||
        isValueUndefined(form.getFieldValue(TransferFormKeys.AMOUNT));
      setIsSubmitDisabled(isDisabled);
    },
    [form, getRecipientAddressInput],
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

  const getTransferData = useCallback(
    async (symbol?: string, fromNetworkKey?: string, amount?: string) => {
      try {
        const _fromNetworkKey = fromNetworkKey || fromNetworkRef.current?.network;
        if (!_fromNetworkKey) return;

        const params: TGetTransferInfoRequest = {
          fromNetwork: _fromNetworkKey,
          toNetwork: toNetwork?.network,
          symbol: symbol || tokenSymbol,
        };
        if (amount) params.amount = amount;
        const comment = getCommentInput();
        if (toWallet?.walletType === WalletTypeEnum.TON && comment) params.memo = comment;

        let authToken = '';
        if (fromWalletType && fromWallet?.isConnected && fromWallet?.account) {
          authToken = await getAuthTokenFromStorage(fromWalletType);
        }

        const res = await getTransferInfo(params, authToken);
        transferInfoRef.current = res.transferInfo;
        setEVMTokenContractAddressRef.current = '0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679'; // res.transferInfo.contractAddress as `0x${string}`; // TODO

        setTransferInfo({
          ...res.transferInfo,
          limitCurrency: formatSymbolDisplay(res.transferInfo.limitCurrency),
          transactionUnit: formatSymbolDisplay(res.transferInfo?.transactionUnit || ''),
        });
      } catch (error) {
        console.log('getTransferData error', error);
      }
    },
    [
      fromWallet?.account,
      fromWallet?.isConnected,
      fromWalletType,
      getAuthTokenFromStorage,
      getCommentInput,
      setEVMTokenContractAddressRef,
      toNetwork?.network,
      toWallet?.walletType,
      tokenSymbol,
    ],
  );

  const getTokenData = useCallback(
    async (isInitCurrentSymbol?: boolean) => {
      try {
        const res = await getTokenList({
          type: BusinessType.Transfer,
        });

        dispatch(setTotalTokenList(res.tokenList));
        totalTokenListRef.current = res.tokenList;

        const allowTokenList = computeTokenList(toNetworkRef.current, res.tokenList);
        dispatch(setTokenList(allowTokenList));

        if (isInitCurrentSymbol && !tokenSymbol) {
          dispatch(setTokenSymbol(allowTokenList[0].symbol));
          currentTokenRef.current = allowTokenList[0];
        } else {
          const exitToken = res.tokenList.find((item) => item.symbol === tokenSymbol);
          if (exitToken) {
            dispatch(setTokenSymbol(exitToken.symbol));
            currentTokenRef.current = exitToken;
          } else {
            dispatch(setTokenSymbol(allowTokenList[0].symbol));
            currentTokenRef.current = allowTokenList[0];
          }
        }

        // to get minAmount and contractAddress
        await getTransferData(currentTokenRef.current.symbol, undefined, '');

        return res.tokenList;
      } catch (error) {
        console.log('getTokenData error', error);
        // SingleMessage.error(handleErrorMessage(error));
        return [];
      }
    },
    [dispatch, getTransferData, tokenSymbol],
  );

  const getNetworkData = useCallback(async () => {
    try {
      const authToken = await getAuthTokenFromStorage(fromWalletType);
      const { networkList } = await getTransferNetworkList(
        { type: BusinessType.Transfer },
        authToken,
      );

      dispatch(setTotalNetworkList(networkList));
      dispatch(setFromNetworkList(networkList));

      if (networkList?.length > 0) {
        // from logic
        const exitFromNetwork = networkList.find((item) => item.network === fromNetwork?.network);
        if (exitFromNetwork && exitFromNetwork.status !== NetworkStatus.Offline) {
          dispatch(setFromNetwork(exitFromNetwork));
          fromNetworkRef.current = exitFromNetwork;
        } else {
          dispatch(setFromNetwork(networkList[0]));
          fromNetworkRef.current = networkList[0];
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
          networkList,
          totalTokenListRef.current,
        );
        console.log('computeToNetworkList toNetworkList', toNetworkList);
        dispatch(setToNetworkList(toNetworkList));

        const exitToNetwork = toNetworkList.find((item) => item.network === toNetwork?.network);
        if (exitToNetwork && exitToNetwork.status !== NetworkStatus.Offline) {
          dispatch(setToNetwork(exitToNetwork));
          toNetworkRef.current = exitToNetwork;
        } else {
          dispatch(setToNetwork(toNetworkList[0]));
          toNetworkRef.current = toNetworkList[0];
        }

        // set to wallet logic
        const _toWalletType = computeWalletType(toNetworkRef.current.network);
        if (_toWalletType) {
          dispatch(setToWalletType(_toWalletType));
        } else {
          dispatch(setToWalletType(undefined));
        }

        // token logic
        const allowTokenList = computeTokenList(toNetworkRef.current, totalTokenListRef.current);
        dispatch(setTokenList(allowTokenList));
        const exitToken = totalTokenListRef.current.find((item) => item.symbol === tokenSymbol);
        if (exitToken) {
          dispatch(setTokenSymbol(exitToken.symbol));
          currentTokenRef.current = exitToken;
        } else {
          dispatch(setTokenSymbol(allowTokenList[0].symbol));
          currentTokenRef.current = allowTokenList[0];
        }
      } else {
        // TODO
        // dispatch(setFromNetwork(undefined));
        // dispatch(setToNetwork(undefined));
      }
    } catch (error: any) {
      console.log('getNetworkData error', error);
    }
  }, [
    dispatch,
    fromNetwork?.network,
    fromWalletType,
    getAuthTokenFromStorage,
    toNetwork?.network,
    tokenSymbol,
  ]);

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
      if (!addressInput) {
        handleFormValidateDataChange({
          [TransferFormKeys.RECIPIENT]: {
            validateStatus: TransferValidateStatus.Normal,
            errorMessage: '',
          },
        });
        await getTransferData(tokenSymbol, undefined, amount);
        return;
      } else if (addressInput.length < 32 || addressInput.length > 59) {
        handleFormValidateDataChange({
          [TransferFormKeys.RECIPIENT]: {
            validateStatus: TransferValidateStatus.Error,
            errorMessage: 'Please enter a correct address.',
          },
        });
        return;
      }

      if (isDIDAddressSuffix(addressInput)) {
        form.setFieldValue(TransferFormKeys.RECIPIENT, removeELFAddressSuffix(addressInput));
      }

      handleFormValidateDataChange({
        [TransferFormKeys.RECIPIENT]: {
          validateStatus: TransferValidateStatus.Normal,
          errorMessage: '',
        },
      });
      await getTransferData(tokenSymbol, undefined, amount);
    } catch (error) {
      console.log('handleRecipientAddressBlur error', error);
      // SingleMessage.error(handleErrorMessage(error));
    }
  }, [
    amount,
    form,
    getRecipientAddressInput,
    getTransferData,
    handleFormValidateDataChange,
    tokenSymbol,
  ]);

  const handleFromNetworkChanged = useCallback(
    async (item: TNetworkItem) => {
      try {
        form.setFieldValue(TransferFormKeys.AMOUNT, '');
        setAmount('');
        setAmountUSD('');
        // handleAmountValidate(); // TODO

        form.setFieldValue(TransferFormKeys.RECIPIENT, '');
        handleRecipientAddressChange('');
        handleFormValidateDataChange({
          [TransferFormKeys.RECIPIENT]: {
            validateStatus: TransferValidateStatus.Normal,
            errorMessage: '',
          },
        });

        form.setFieldValue(TransferFormKeys.COMMENT, '');

        await getTransferData(tokenSymbol, item.network, '');

        getBalanceInterval(
          transferInfoRef.current?.contractAddress || '',
          item.network,
          currentTokenRef.current,
        );
        getBalance(
          true,
          transferInfoRef.current?.contractAddress || '',
          item.network,
          currentTokenRef.current,
        );
      } catch (error) {
        console.log('handleFromNetworkChanged error', error);
      }
    },
    [
      form,
      getBalance,
      getBalanceInterval,
      getTransferData,
      handleFormValidateDataChange,
      handleRecipientAddressChange,
      tokenSymbol,
    ],
  );

  const handleTokenChanged = useCallback(
    async (item: TTokenItem) => {
      try {
        form.setFieldValue(TransferFormKeys.AMOUNT, '');
        setAmount('');
        setAmountUSD('');
        // handleAmountValidate(); // TODO

        await getTransferData(item.symbol, undefined, '');

        getBalanceInterval(
          transferInfoRef.current?.contractAddress || '',
          fromNetwork?.network,
          item,
        );
        getBalance(
          true,
          transferInfoRef.current?.contractAddress || '',
          fromNetwork?.network,
          item,
        );
      } catch (error) {
        console.log('handleFromNetworkChanged error', error);
      }
    },
    [form, fromNetwork?.network, getBalance, getBalanceInterval, getTransferData],
  );

  const getAmountUSD = useCallback(async () => {
    const res = await getTokenPrices({
      symbols: tokenSymbol,
    });

    setAmountPriceUSD(res.items[0].priceUsd);
  }, [tokenSymbol]);

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(value);

      const _amountUsd = BigNumber(amountPriceUsd)
        .times(BigNumber(Number(value)))
        .toFixed(2);

      setAmountUSD(_amountUsd);
    },
    [amountPriceUsd],
  );

  const handleAmountBlur = useCallback(async () => {
    try {
      // TODO
      // if (handleAmountValidate()) {
      await getTransferData(tokenSymbol, undefined, amount);

      // update amount usd display
      setAmountUSD(BigNumber(transferInfoRef.current.amountUsd || '').toFixed(2));

      // update usd price
      getAmountUSD();
      // }
    } catch (error) {
      console.log('handleAmountBlur error', error);
      // SingleMessage.error(handleErrorMessage(error));
    }
  }, [amount, getAmountUSD, getTransferData, tokenSymbol]);

  const handleClickMax = useCallback(async () => {
    if (isAelfChain(fromNetwork?.network) && tokenSymbol === 'ELF') {
      try {
        setLoading(true);
        await getTransferData(tokenSymbol, undefined, amount);
        let _maxInput = balance;
        const aelfFee = transferInfoRef.current?.aelfTransactionFee;
        if (aelfFee && ZERO.plus(aelfFee).gt(0)) {
          const isEnoughAllowance = await checkIsEnoughAllowance({
            chainId: fromNetwork.network as SupportedELFChainId,
            symbol: tokenSymbol,
            address: fromWallet?.account || '',
            approveTargetAddress: currentToken.contractAddress,
            amount: _maxInput,
          });
          let _maxInputBignumber;
          if (isEnoughAllowance) {
            _maxInputBignumber = ZERO.plus(balance).minus(aelfFee);
          } else {
            _maxInputBignumber = ZERO.plus(balance).minus(aelfFee).minus(APPROVE_ELF_FEE);
          }
          _maxInput = _maxInputBignumber.lt(0) ? '0' : _maxInputBignumber.toFixed();
        }

        setAmount(_maxInput);
        form.setFieldValue(TransferFormKeys.AMOUNT, _maxInput);
      } catch (error) {
        console.log('handleClickMax error', error);
        // SingleMessage.error(handleErrorMessage(error));
      } finally {
        setLoading(false);
      }
    } else {
      setAmount(balance);
      form.setFieldValue(TransferFormKeys.AMOUNT, balance);
    }
  }, [
    amount,
    balance,
    currentToken.contractAddress,
    form,
    fromNetwork.network,
    fromWallet?.account,
    getTransferData,
    setLoading,
    tokenSymbol,
  ]);

  const router = useRouter();
  const handleClickProcessingTip = useCallback(() => {
    router.push('/history');
  }, [router]);

  const init = useCallback(async () => {
    await getNetworkData();
    await getTokenData();
    getAmountUSD();

    getBalanceInterval(
      transferInfoRef.current?.contractAddress || '',
      fromNetworkRef.current?.network,
      currentTokenRef.current,
    );
  }, [getAmountUSD, getBalanceInterval, getNetworkData, getTokenData]);
  const initRef = useRef(init);
  initRef.current = init;

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.CrossChainTransfer));
  });

  useEffect(() => {
    // TODO TCrossChainTransferEntryConfig
    initRef.current();
  }, []);

  useEffect(() => {
    if (!fromWallet?.isConnected) {
      setFormValidateData(JSON.parse(JSON.stringify(TRANSFER_FORM_VALIDATE_DATA)));
    }
  }, [fromWallet?.isConnected]);

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
      isSubmitDisabled={isSubmitDisabled}
      recipientAddress={recipientAddressInput}
      onFromNetworkChanged={handleFromNetworkChanged}
      onTokenChanged={handleTokenChanged}
      onAmountChange={handleAmountChange}
      onAmountBlur={handleAmountBlur}
      onClickMax={handleClickMax}
      onRecipientAddressChange={handleRecipientAddressChange}
      onRecipientAddressBlur={handleRecipientAddressBlur}
      onClickProcessingTip={handleClickProcessingTip}
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
      isSubmitDisabled={isSubmitDisabled}
      recipientAddress={recipientAddressInput}
      onFromNetworkChanged={handleFromNetworkChanged}
      onAmountChange={handleAmountChange}
      onAmountBlur={handleAmountBlur}
      onClickMax={handleClickMax}
      onRecipientAddressChange={handleRecipientAddressChange}
      onRecipientAddressBlur={handleRecipientAddressBlur}
      onClickProcessingTip={handleClickProcessingTip}
    />
  );
}
