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
import { getNetworkList, getTokenList, getTransferInfo } from 'utils/api/transfer';
import {
  InitialCrossChainTransferState,
  setFromNetwork,
  setFromNetworkList,
  setRecipientAddress,
  setTokenList,
  setTokenSymbol,
  setToNetwork,
  setToNetworkList,
  setTotalNetworkList,
  setTotalTokenList,
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
import { isAelfChain } from 'utils/wallet';
import { checkIsEnoughAllowance } from 'utils/contract';
import { APPROVE_ELF_FEE } from 'constants/withdraw';
import { SupportedELFChainId } from 'constants/index';
import { getLocalJWT } from 'api/utils';

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
  const [recipientAddressInput, setRecipientAddressInput] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [amount, setAmount] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountPriceUsd, setAmountPriceUSD] = useState<number>(0);

  // TODO
  const balance = '0';
  // const [balance, setBalance] = useState('0');

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
          symbol: symbol || tokenSymbol,
        };
        if (amount) params.amount = amount;
        const comment = getCommentInput();
        if (toWallet?.walletType === WalletTypeEnum.TON && comment) params.memo = comment;

        let authToken = '';
        if (fromWalletType && fromWallet?.isConnected && fromWallet?.account) {
          const key = fromWallet?.account + fromWallet?.walletType || fromWalletType;
          const localJWT = getLocalJWT(key);
          if (localJWT) {
            const token_type = localJWT.token_type;
            const access_token = localJWT.access_token;
            authToken = `${token_type} ${access_token}`;
          }
        }

        const res = await getTransferInfo(params, authToken);
        setTransferInfo({
          ...res.transferInfo,
          limitCurrency: formatSymbolDisplay(res.transferInfo.limitCurrency),
          transactionUnit: formatSymbolDisplay(res.transferInfo?.transactionUnit || ''),
        });

        return res;
      } catch (error) {
        console.log('getTransferData error', error);
        throw error;
      }
    },
    [fromWallet, fromWalletType, getCommentInput, toWallet?.walletType, tokenSymbol],
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

        let _tokenSymbol = '';
        if (isInitCurrentSymbol && !tokenSymbol) {
          dispatch(setTokenSymbol(allowTokenList[0].symbol));
          _tokenSymbol = allowTokenList[0].symbol;
        } else {
          const exitToken = res.tokenList.find((item) => item.symbol === tokenSymbol);
          if (exitToken) {
            dispatch(setTokenSymbol(exitToken.symbol));
            _tokenSymbol = exitToken.symbol;
          } else {
            dispatch(setTokenSymbol(allowTokenList[0].symbol));
            _tokenSymbol = allowTokenList[0].symbol;
          }
        }

        // to get minAmount and contractAddress
        await getTransferData(_tokenSymbol, undefined, '');

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
      const { networkList } = await getNetworkList({ type: BusinessType.Transfer });

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

        const toNetworkList = computeToNetworkList(
          fromNetworkRef.current,
          networkList,
          totalTokenListRef.current,
        );
        console.log('computeToNetworkList toNetworkList', toNetworkList);
        dispatch(setToNetworkList(toNetworkList));

        // to logic
        const exitToNetwork = toNetworkList.find((item) => item.network === toNetwork?.network);
        if (exitToNetwork && exitToNetwork.status !== NetworkStatus.Offline) {
          dispatch(setToNetwork(exitToNetwork));
          toNetworkRef.current = exitToNetwork;
        } else {
          dispatch(setToNetwork(toNetworkList[0]));
          toNetworkRef.current = toNetworkList[0];
        }

        // token logic
        const allowTokenList = computeTokenList(toNetworkRef.current, totalTokenListRef.current);
        dispatch(setTokenList(allowTokenList));
        const exitToken = totalTokenListRef.current.find((item) => item.symbol === tokenSymbol);
        if (exitToken) {
          dispatch(setTokenSymbol(exitToken.symbol));
        } else {
          dispatch(setTokenSymbol(allowTokenList[0].symbol));
        }
      } else {
        // TODO
        // dispatch(setFromNetwork(undefined));
        // dispatch(setToNetwork(undefined));
      }
    } catch (error: any) {
      console.log('getNetworkData error', error);
    }
  }, [dispatch, fromNetwork?.network, toNetwork?.network, tokenSymbol]);

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
        await getTransferData(tokenSymbol, amount);
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
      await getTransferData(tokenSymbol, amount);
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
      } catch (error) {
        console.log('handleFromNetworkChanged error', error);
      }
    },
    [
      form,
      getTransferData,
      handleFormValidateDataChange,
      handleRecipientAddressChange,
      tokenSymbol,
    ],
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
      const transferRes = await getTransferData(tokenSymbol, amount);

      // update amount usd display
      setAmountUSD(BigNumber(transferRes?.transferInfo.amountUsd || '').toFixed(2));

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
        const res = await getTransferData(tokenSymbol, amount);
        let _maxInput = balance;
        const aelfFee = res?.transferInfo?.aelfTransactionFee;
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
  }, [getAmountUSD, getNetworkData, getTokenData]);
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
