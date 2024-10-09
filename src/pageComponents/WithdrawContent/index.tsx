/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Form } from 'antd';
import clsx from 'clsx';
import SelectChainWrapper from 'pageComponents/WithdrawContent/SelectChainWrapper';
import FormTextarea from 'components/FormTextarea';
import SelectToken from './SelectToken';
import SelectNetwork from './SelectNetwork';
import {
  TNetworkItem,
  TWithdrawInfo,
  TGetNetworkListRequest,
  BusinessType,
  TGetWithdrawInfoRequest,
  TTokenItem,
  NetworkStatus,
  TGetWithdrawInfoResult,
} from 'types/api';
import {
  useAppDispatch,
  useCommonState,
  useLoading,
  useRecordsState,
  useWithdrawState,
} from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { CHAIN_LIST, IChainNameItem, DEFAULT_NULL_VALUE } from 'constants/index';
import { getNetworkList, getTokenList, getWithdrawInfo } from 'utils/api/deposit';
import { CONTRACT_ADDRESS } from 'constants/deposit';
import { checkIsEnoughAllowance, getBalance } from 'utils/contract';
import { SingleMessage } from '@etransfer/ui-react';
import { divDecimals } from 'utils/calculate';
import { ZERO } from 'constants/calculate';
import BigNumber from 'bignumber.js';
import {
  InitialWithdrawState,
  setCurrentSymbol,
  setTokenList,
  setWithdrawAddress,
  setWithdrawChainItem,
  setWithdrawCurrentNetwork,
  setWithdrawNetworkList,
} from 'store/reducers/withdraw/slice';
import { useEffectOnce } from 'react-use';
import PartialLoading from 'components/PartialLoading';
import {
  AmountGreaterThanBalanceMessage,
  APPROVE_ELF_FEE,
  CommentCheckTip,
  InitialWithdrawInfo,
  WithdrawAddressErrorCodeList,
} from 'constants/withdraw';
import { CommonErrorNameType } from 'api/types';
import { ContractAddressForMobile, ContractAddressForWeb } from './ContractAddress';
import { handleErrorMessage } from '@etransfer/utils';
import { useGetAccount, useIsLogin } from 'hooks/wallet';
import FormInput from 'pageComponents/WithdrawContent/FormAmountInput';
import {
  formatSymbolDisplay,
  formatWithCommas,
  parseWithCommas,
  parseWithStringCommas,
} from 'utils/format';
import { devices, sleep } from '@portkey/utils';
import { useWithdraw } from 'hooks/withdraw';
import { isAuthTokenError, isHtmlError, isWriteOperationError } from 'utils/api/error';
import myEvents from 'utils/myEvent';
import {
  isDIDAddressSuffix,
  removeAddressSuffix,
  removeELFAddressSuffix,
} from 'utils/aelf/aelfBase';
import { SideMenuKey } from 'constants/home';
import { useRouter, useSearchParams } from 'next/navigation';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import FAQ from 'components/FAQ';
import { FAQ_WITHDRAW } from 'constants/footer';
import { PortkeyVersion } from 'constants/wallet';
import { TelegramPlatform } from 'utils/telegram';
import { useSetAuthFromStorage } from 'hooks/authToken';
import WithdrawFooter from './WithdrawFooter';
import RemainingLimit from './RemainingLimit';
import CommentFormItemLabel from './CommentFormItemLabel';
import { BlockchainNetworkType } from 'constants/network';
import { MEMO_REG } from 'utils/reg';
import { ProcessingTip } from 'components/Tips/ProcessingTip';

enum ValidateStatus {
  Error = 'error',
  Warning = 'warning',
  Normal = '',
}

enum FormKeys {
  TOKEN = 'token',
  ADDRESS = 'address',
  COMMENT = 'comment',
  NETWORK = 'network',
  AMOUNT = 'amount',
}

type TFormValues = {
  [FormKeys.TOKEN]: string;
  [FormKeys.ADDRESS]: string;
  [FormKeys.NETWORK]: TNetworkItem;
  [FormKeys.AMOUNT]: string;
};

const FORM_VALIDATE_DATA = {
  [FormKeys.TOKEN]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
  [FormKeys.ADDRESS]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
  [FormKeys.NETWORK]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
  [FormKeys.AMOUNT]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
  [FormKeys.COMMENT]: { validateStatus: ValidateStatus.Warning, errorMessage: CommentCheckTip },
};

export default function WithdrawContent() {
  const dispatch = useAppDispatch();
  const isAndroid = devices.isMobile().android;
  const { isPadPX, isMobilePX } = useCommonState();
  const { depositProcessingCount, withdrawProcessingCount } = useRecordsState();
  const isLogin = useIsLogin();
  const isLoginRef = useRef(isLogin);
  isLoginRef.current = isLogin;
  const withdraw = useWithdrawState();
  const accounts = useGetAccount();
  const { currentSymbol, tokenList, currentChainItem } = useWithdraw();
  const currentChainItemRef = useRef<IChainNameItem>(currentChainItem || CHAIN_LIST[0]);
  const { setLoading } = useLoading();
  const [isShowNetworkLoading, setIsShowNetworkLoading] = useState(false);
  const [networkList, setNetworkList] = useState<TNetworkItem[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<TNetworkItem>();
  const currentNetworkRef = useRef<TNetworkItem>();
  const [form] = Form.useForm<TFormValues>();
  const [withdrawInfo, setWithdrawInfo] = useState<TWithdrawInfo>(InitialWithdrawInfo);
  const [balance, setBalance] = useState('0');
  const [maxBalance, setMaxBalance] = useState('');
  const [isMaxBalanceLoading, setIsMaxBalanceLoading] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isNetworkDisable, setIsNetworkDisable] = useState(false);
  const [formValidateData, setFormValidateData] = useState<{
    [key in FormKeys]: { validateStatus: ValidateStatus; errorMessage: string };
  }>(JSON.parse(JSON.stringify(FORM_VALIDATE_DATA)));
  const [isTransactionFeeLoading, setIsTransactionFeeLoading] = useState(false);

  const getTransactionFeeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const minAmount = useMemo(() => {
    return withdrawInfo?.minAmount || '0.2';
  }, [withdrawInfo?.minAmount]);
  const receiveAmount = useMemo(() => {
    let result = '';
    if (
      !balance ||
      !withdrawInfo.transactionFee ||
      ZERO.plus(balance).isLessThan(ZERO.plus(withdrawInfo.transactionFee)) ||
      ZERO.plus(balance).isLessThan(ZERO.plus(minAmount))
    ) {
      result = '';
    } else {
      result = BigNumber(balance).minus(BigNumber(withdrawInfo.transactionFee)).toFixed();
    }

    return result;
  }, [balance, minAmount, withdrawInfo.transactionFee]);

  const getMaxBalanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentToken = useMemo(() => {
    const item = tokenList?.find((item) => item.symbol === currentSymbol);
    return item?.symbol ? item : InitialWithdrawState.tokenList[0];
  }, [currentSymbol, tokenList]);

  const currentTokenDecimal = useMemo(() => currentToken.decimals, [currentToken.decimals]);

  const getAddressInput = useCallback(() => {
    return form.getFieldValue(FormKeys.ADDRESS)?.trim();
  }, [form]);

  const getCommentInput = useCallback(() => {
    return form.getFieldValue(FormKeys.COMMENT)?.trim();
  }, [form]);

  const judgeIsSubmitDisabled = useCallback(
    (currentFormValidateData: typeof formValidateData) => {
      const isValueUndefined = (value: unknown) => value === undefined || value === '';
      const isDisabled =
        currentFormValidateData[FormKeys.ADDRESS].validateStatus === ValidateStatus.Error ||
        currentFormValidateData[FormKeys.NETWORK].validateStatus === ValidateStatus.Error ||
        currentFormValidateData[FormKeys.AMOUNT].validateStatus === ValidateStatus.Error ||
        isValueUndefined(getAddressInput()) ||
        isValueUndefined(currentNetworkRef.current) ||
        isValueUndefined(form.getFieldValue(FormKeys.AMOUNT));
      setIsSubmitDisabled(isDisabled);
    },
    [form, getAddressInput],
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

  const getToken = useCallback(
    async (isInitCurrentSymbol?: boolean) => {
      const res = await getTokenList({
        type: BusinessType.Withdraw,
        chainId: currentChainItemRef.current.key,
      });

      dispatch(setTokenList(res.tokenList));

      if (isInitCurrentSymbol && !currentSymbol) {
        dispatch(setCurrentSymbol(res.tokenList[0].symbol));
      }
      return res.tokenList;
    },
    [dispatch, currentSymbol],
  );

  const getAllNetworkData = useCallback(async () => {
    // only get data and render page, don't update error
    try {
      setIsShowNetworkLoading(true);
      const { networkList } = await getNetworkList({
        type: BusinessType.Withdraw,
        chainId: currentChainItemRef.current.key,
        symbol: currentSymbol,
      });
      setNetworkList(networkList);
      dispatch(setWithdrawNetworkList(networkList));
    } catch (error) {
      setIsShowNetworkLoading(false);
    } finally {
      setIsShowNetworkLoading(false);
    }
  }, [currentSymbol, dispatch]);

  const getNetworkData = useCallback(
    async ({ symbol, address }: Omit<TGetNetworkListRequest, 'type' | 'chainId'>) => {
      try {
        setIsShowNetworkLoading(true);
        const params: TGetNetworkListRequest = {
          type: BusinessType.Withdraw,
          chainId: currentChainItemRef.current.key,
          symbol: symbol,
        };
        if (address) {
          params.address = isDIDAddressSuffix(address) ? removeELFAddressSuffix(address) : address;
        }

        const { networkList } = await getNetworkList(params);
        setNetworkList(networkList);
        dispatch(setWithdrawNetworkList(networkList));

        if (networkList?.length === 1 && networkList[0].status !== NetworkStatus.Offline) {
          setCurrentNetwork(networkList[0]);
          currentNetworkRef.current = networkList[0];
          dispatch(setWithdrawCurrentNetwork(networkList[0]));
        } else {
          const exitNetwork = networkList.find(
            (item) => item.network === currentNetworkRef.current?.network,
          );
          if (!exitNetwork?.network) {
            setCurrentNetwork(undefined);
            currentNetworkRef.current = undefined;
            dispatch(setWithdrawCurrentNetwork(undefined));
          } else {
            if (exitNetwork.status !== NetworkStatus.Offline) {
              setCurrentNetwork(exitNetwork);
              dispatch(setWithdrawCurrentNetwork(exitNetwork));
            } else {
              setCurrentNetwork(undefined);
              currentNetworkRef.current = undefined;
              dispatch(setWithdrawCurrentNetwork(undefined));
            }
          }
        }
        const isSolanaNetwork = networkList?.length === 1 && networkList[0].network === 'Solana';
        const isAddressShorterThanUsual =
          params.address && params.address.length >= 32 && params.address.length <= 39;
        if (isSolanaNetwork && isAddressShorterThanUsual) {
          // Only the Solana network has this warning
          handleFormValidateDataChange({
            [FormKeys.ADDRESS]: {
              validateStatus: ValidateStatus.Warning,
              errorMessage:
                "The address you entered is shorter than usual. Please double-check to ensure it's the correct address.",
            },
          });
        } else {
          handleFormValidateDataChange({
            [FormKeys.ADDRESS]: {
              validateStatus: ValidateStatus.Normal,
              errorMessage: '',
            },
          });
        }
        setIsNetworkDisable(false);
        setIsShowNetworkLoading(false);
      } catch (error: any) {
        console.log('getNetworkData error', error);

        setIsShowNetworkLoading(false);
        if (WithdrawAddressErrorCodeList.includes(error?.code)) {
          handleFormValidateDataChange({
            [FormKeys.ADDRESS]: {
              validateStatus: ValidateStatus.Error,
              errorMessage: error?.message,
            },
          });
          setIsNetworkDisable(true);
          setCurrentNetwork(undefined);
          getAllNetworkData();
        } else {
          handleFormValidateDataChange({
            [FormKeys.ADDRESS]: {
              validateStatus: ValidateStatus.Normal,
              errorMessage: '',
            },
          });
          if (
            error.name !== CommonErrorNameType.CANCEL &&
            !isWriteOperationError(error?.code, handleErrorMessage(error)) &&
            !isAuthTokenError(error)
          ) {
            SingleMessage.error(handleErrorMessage(error));
          }
          setNetworkList([]);
        }
        dispatch(setWithdrawNetworkList([]));
        if (error.name !== CommonErrorNameType.CANCEL && !isAuthTokenError(error)) {
          setCurrentNetwork(undefined);
          currentNetworkRef.current = undefined;
          dispatch(setWithdrawCurrentNetwork(undefined));
        }
      } finally {
        setIsShowNetworkLoading(false);
      }
    },
    [dispatch, getAllNetworkData, handleFormValidateDataChange],
  );

  const handleAmountValidate = useCallback(
    (newMinAmount?: string, newTransactionUnit?: string, newMaxBalance?: string) => {
      if (!isLoginRef.current) return;

      const amount = form.getFieldValue(FormKeys.AMOUNT);
      if (!amount) {
        handleFormValidateDataChange({
          [FormKeys.AMOUNT]: {
            validateStatus: ValidateStatus.Normal,
            errorMessage: '',
          },
        });
        return;
      }
      const parserNumber = Number(parseWithCommas(amount));
      const currentMinAmount = Number(parseWithCommas(newMinAmount || minAmount));
      const currentTransactionUnit = formatSymbolDisplay(
        newTransactionUnit || withdrawInfo.transactionUnit,
      );
      if (parserNumber < currentMinAmount) {
        handleFormValidateDataChange({
          [FormKeys.AMOUNT]: {
            validateStatus: ValidateStatus.Error,
            errorMessage: `The minimum amount is ${currentMinAmount} ${currentTransactionUnit}. Please enter a value no less than this.`,
          },
        });
        return;
      } else if (
        withdrawInfo.remainingLimit &&
        parserNumber > Number(parseWithCommas(withdrawInfo.remainingLimit))
      ) {
        handleFormValidateDataChange({
          [FormKeys.AMOUNT]: {
            validateStatus: ValidateStatus.Error,
            errorMessage: AmountGreaterThanBalanceMessage,
          },
        });
        return;
      } else if (parserNumber > Number(parseWithCommas(newMaxBalance || maxBalance))) {
        handleFormValidateDataChange({
          [FormKeys.AMOUNT]: {
            validateStatus: ValidateStatus.Error,
            errorMessage:
              'Insufficient balance. Please consider transferring a smaller amount or topping up before you try again.',
          },
        });
        return;
      } else {
        handleFormValidateDataChange({
          [FormKeys.AMOUNT]: {
            validateStatus: ValidateStatus.Normal,
            errorMessage: '',
          },
        });

        return true;
      }
    },
    [
      form,
      handleFormValidateDataChange,
      maxBalance,
      minAmount,
      withdrawInfo.remainingLimit,
      withdrawInfo.transactionUnit,
    ],
  );

  const getWithdrawData = useCallback(
    async (optionSymbol?: string, newMaxBalance?: string): Promise<any> => {
      console.log('getWithdrawData >>>>>> isLogin', isLoginRef.current);
      if (!isLoginRef.current) return;

      const symbol = optionSymbol || currentSymbol;
      try {
        setIsTransactionFeeLoading(true);
        const params: TGetWithdrawInfoRequest = {
          chainId: currentChainItemRef.current.key,
          symbol,
          version: PortkeyVersion.v2,
          address: getAddressInput(),
        };
        if (currentNetworkRef.current?.network) {
          params.network = currentNetworkRef.current?.network;
        }
        // params add amount to get amountUsd、receiveAmountUsd
        const amount = form.getFieldValue(FormKeys.AMOUNT);
        if (amount) {
          params.amount = amount;
        }
        // params add memo to check memo
        if (getCommentInput()) {
          params.memo = getCommentInput();
        }

        const res = await getWithdrawInfo(params);

        setWithdrawInfo({
          ...res.withdrawInfo,
          limitCurrency: formatSymbolDisplay(res.withdrawInfo.limitCurrency),
          transactionUnit: formatSymbolDisplay(res.withdrawInfo.transactionUnit),
        });
        setIsTransactionFeeLoading(false);

        handleAmountValidate(
          res.withdrawInfo?.minAmount,
          res.withdrawInfo?.transactionUnit,
          newMaxBalance,
        );
        return res;
      } catch (error: any) {
        // when network error, transactionUnit should as the same with symbol
        setWithdrawInfo({
          ...InitialWithdrawInfo,
          limitCurrency: formatSymbolDisplay(symbol),
          transactionUnit: formatSymbolDisplay(symbol),
        });
        if (
          error.name !== CommonErrorNameType.CANCEL &&
          !isHtmlError(error?.code, handleErrorMessage(error)) &&
          !isWriteOperationError(error?.code, handleErrorMessage(error)) &&
          !isAuthTokenError(error)
        ) {
          SingleMessage.error(handleErrorMessage(error));
          setIsTransactionFeeLoading(false);
        }
      }
    },
    [currentSymbol, form, getAddressInput, getCommentInput, handleAmountValidate],
  );

  useEffect(() => {
    if (
      (currentNetwork?.network === 'SETH' || currentNetwork?.network === 'ETH') &&
      Number(withdrawInfo.feeUsd) > 60
    ) {
      handleFormValidateDataChange({
        [FormKeys.NETWORK]: {
          validateStatus: ValidateStatus.Warning,
          errorMessage:
            "Due to Ethereum's high gas price, it's advisable to delay your withdrawal.",
        },
      });
    } else {
      handleFormValidateDataChange({
        [FormKeys.NETWORK]: {
          validateStatus: ValidateStatus.Normal,
          errorMessage: '',
        },
      });
    }
  }, [currentNetwork?.network, handleFormValidateDataChange, withdrawInfo.feeUsd]);

  const getMaxBalance = useCallback(
    async (isLoading: boolean, item?: TTokenItem) => {
      try {
        console.log('>>>>>> getMaxBalance', item?.symbol);
        const symbol = item?.symbol || currentSymbol;
        const decimal = item?.decimals || currentTokenDecimal;
        const caAddress = accounts?.[currentChainItemRef.current.key];
        if (!caAddress) return '';
        isLoading && setIsMaxBalanceLoading(true);
        const maxBalance = await getBalance({
          symbol: symbol,
          chainId: currentChainItemRef.current.key,
          caAddress,
        });
        const tempMaxBalance = divDecimals(maxBalance, decimal).toFixed();
        setMaxBalance((preMaxBalance) => {
          if (preMaxBalance !== tempMaxBalance) {
            if (handleAmountValidate(undefined, undefined, tempMaxBalance)) {
              getWithdrawData(undefined, tempMaxBalance);
            }
          }
          return tempMaxBalance;
        });
        return tempMaxBalance;
      } catch (error) {
        SingleMessage.error(handleErrorMessage(error));
        throw new Error('Failed to get balance.');
      } finally {
        isLoading && setIsMaxBalanceLoading(false);
      }
    },
    [accounts, currentSymbol, currentTokenDecimal, getWithdrawData, handleAmountValidate],
  );

  const getMaxBalanceRef = useRef(getMaxBalance);
  getMaxBalanceRef.current = getMaxBalance;
  const getMaxBalanceInterval = useCallback(async (item?: TTokenItem) => {
    console.log('>>>>>> getMaxBalanceInterval start', item?.symbol);
    if (getMaxBalanceTimerRef.current) clearInterval(getMaxBalanceTimerRef.current);
    getMaxBalanceTimerRef.current = setInterval(async () => {
      console.log('>>>>>> getMaxBalanceInterval interval', item?.symbol);
      await getMaxBalanceRef.current(false, item);
    }, 8000);
  }, []);

  const handleChainChanged = useCallback(
    async (item: IChainNameItem, token?: TTokenItem) => {
      try {
        setLoading(true);
        currentChainItemRef.current = item;
        dispatch(setWithdrawChainItem(item));
        setBalance('');
        form.setFieldValue(FormKeys.AMOUNT, '');
        handleAmountValidate();

        // reset max balance
        getMaxBalanceInterval();
        getMaxBalance(true, token);

        await getToken(true);
        await getNetworkData({
          symbol: token?.symbol || currentSymbol,
          address: getAddressInput() || undefined,
        });
        await getWithdrawData(token?.symbol || currentSymbol);
      } catch (error) {
        console.log('Change chain error: ', error);
      } finally {
        setLoading(false);
      }
    },
    [
      currentSymbol,
      dispatch,
      form,
      getAddressInput,
      getMaxBalance,
      getMaxBalanceInterval,
      getNetworkData,
      getToken,
      getWithdrawData,
      handleAmountValidate,
      setLoading,
    ],
  );

  useEffect(() => {
    if (!withdrawInfo.expiredTimestamp) {
      return;
    }
    if (getTransactionFeeTimerRef.current) {
      clearInterval(getTransactionFeeTimerRef.current);
    }
    getTransactionFeeTimerRef.current = setInterval(async () => {
      if (
        new Date().getTime() > withdrawInfo.expiredTimestamp &&
        currentNetworkRef.current?.network
      ) {
        await getWithdrawData();
      }
    }, 10000);
    return () => {
      if (getTransactionFeeTimerRef.current) {
        clearInterval(getTransactionFeeTimerRef.current);
      }
    };
  }, [getWithdrawData, withdrawInfo.expiredTimestamp, currentNetworkRef.current?.network]);

  const handleNetworkChanged = useCallback(
    async (item: TNetworkItem) => {
      setCurrentNetwork(item);
      currentNetworkRef.current = item;
      dispatch(setWithdrawCurrentNetwork(item));
      form.setFieldValue(FormKeys.AMOUNT, '');
      setBalance('');
      handleAmountValidate();
      await getWithdrawData();
    },
    [dispatch, form, getWithdrawData, handleAmountValidate],
  );

  const setMaxToken = useCallback(async () => {
    if (maxBalance && currentSymbol === 'ELF') {
      try {
        setLoading(true);
        const res: TGetWithdrawInfoResult = await getWithdrawData();
        let _maxBalance = maxBalance;
        const isEnoughAllowance = await checkIsEnoughAllowance({
          chainId: currentChainItemRef.current.key,
          symbol: currentSymbol,
          address: accounts?.[currentChainItem.key] || '',
          approveTargetAddress: currentToken.contractAddress,
          amount: _maxBalance,
        });
        if (res?.withdrawInfo?.aelfTransactionFee && isEnoughAllowance) {
          const _maxBalanceBignumber = ZERO.plus(maxBalance).minus(
            res.withdrawInfo.aelfTransactionFee,
          );
          _maxBalance = _maxBalanceBignumber.lt(0) ? '0' : _maxBalanceBignumber.toFixed();
        } else if (res?.withdrawInfo?.aelfTransactionFee && !isEnoughAllowance) {
          const _maxBalanceBignumber = ZERO.plus(maxBalance)
            .minus(res.withdrawInfo.aelfTransactionFee)
            .minus(APPROVE_ELF_FEE);

          _maxBalance = _maxBalanceBignumber.lt(0) ? '0' : _maxBalanceBignumber.toFixed();
        }

        setBalance(_maxBalance);
        form.setFieldValue(FormKeys.AMOUNT, _maxBalance);
      } finally {
        setLoading(false);
      }
    } else {
      setBalance(maxBalance);
      form.setFieldValue(FormKeys.AMOUNT, maxBalance);

      if (handleAmountValidate()) {
        await getWithdrawData();
      }
    }
  }, [
    maxBalance,
    currentSymbol,
    setLoading,
    getWithdrawData,
    accounts,
    currentChainItem.key,
    currentToken.contractAddress,
    form,
    handleAmountValidate,
  ]);

  const onAddressChange = useCallback(
    (value: string | null) => {
      dispatch(setWithdrawAddress(value || ''));
    },
    [dispatch],
  );

  const onAddressBlur = useCallback(async () => {
    const addressInput = getAddressInput();
    dispatch(setWithdrawAddress(addressInput));

    if (!addressInput) {
      handleFormValidateDataChange({
        [FormKeys.ADDRESS]: {
          validateStatus: ValidateStatus.Normal,
          errorMessage: '',
        },
      });
      await getNetworkData({
        symbol: currentSymbol,
        address: addressInput,
      });
      await getWithdrawData();
      return;
    } else if (addressInput.length < 32 || addressInput.length > 59) {
      handleFormValidateDataChange({
        [FormKeys.ADDRESS]: {
          validateStatus: ValidateStatus.Error,
          errorMessage: 'Please enter a correct address.',
        },
      });
      setIsNetworkDisable(true);
      setCurrentNetwork(undefined);
      await getAllNetworkData();
      return;
    }

    if (isDIDAddressSuffix(addressInput)) {
      form.setFieldValue(FormKeys.ADDRESS, removeELFAddressSuffix(addressInput));
      dispatch(setWithdrawAddress(removeAddressSuffix(addressInput)));
    }

    await getNetworkData({
      symbol: currentSymbol,
      address: addressInput,
    });

    await getWithdrawData();
  }, [
    currentSymbol,
    dispatch,
    form,
    getAddressInput,
    getAllNetworkData,
    getNetworkData,
    getWithdrawData,
    handleFormValidateDataChange,
  ]);

  const onCommentChange = useCallback((value: string | null) => {
    console.log(value);
  }, []);

  const handleTokenChange = useCallback(
    async (item: TTokenItem) => {
      // when network failed, transactionUnit should show as symbol
      setWithdrawInfo({
        ...withdrawInfo,
        limitCurrency: formatSymbolDisplay(item.symbol),
        transactionUnit: formatSymbolDisplay(item.symbol),
      });

      try {
        setLoading(true);
        setBalance('');

        // change token and empty form key's value
        form.setFieldValue(FormKeys.AMOUNT, '');
        form.setFieldValue(FormKeys.ADDRESS, '');
        form.setFieldValue(FormKeys.NETWORK, '');
        form.setFieldValue(FormKeys.COMMENT, '');
        handleAmountValidate();
        dispatch(setWithdrawAddress(''));
        currentNetworkRef.current = undefined;
        dispatch(setWithdrawCurrentNetwork(undefined));

        // reset max balance
        getMaxBalanceInterval(item);
        getMaxBalance(true, item);

        await getNetworkData({
          symbol: item.symbol,
          address: getAddressInput() || undefined,
        });
        await getWithdrawData(item.symbol);
      } finally {
        setLoading(false);
      }
    },
    [
      dispatch,
      form,
      getAddressInput,
      getMaxBalance,
      getMaxBalanceInterval,
      getNetworkData,
      getWithdrawData,
      handleAmountValidate,
      setLoading,
      withdrawInfo,
    ],
  );

  const clickSuccessOk = useCallback(() => {
    setBalance('');
    form.setFieldValue(FormKeys.AMOUNT, '');

    getWithdrawData();
  }, [form, getWithdrawData]);

  const clickFailedOk = useCallback(() => {
    setBalance('');
    form.setFieldValue(FormKeys.AMOUNT, '');

    getWithdrawData();
  }, [form, getWithdrawData]);

  const searchParams = useSearchParams();
  const routeQuery = useMemo(
    () => ({
      type: searchParams.get('type') as SideMenuKey,
      chainId: searchParams.get('chainId'),
      tokenSymbol: searchParams.get('tokenSymbol'),
      withdrawAddress: searchParams.get('withdrawAddress'),
    }),
    [searchParams],
  );

  const setAuthFromStorage = useSetAuthFromStorage();
  const init = useCallback(async () => {
    try {
      await setAuthFromStorage();
      await sleep(500);

      let newCurrentSymbol = currentSymbol;
      let newTokenList = tokenList;
      setLoading(true);

      if (routeQuery.chainId) {
        const chainItem = CHAIN_LIST.find((item) => item.key === routeQuery.chainId);
        if (chainItem) {
          currentChainItemRef.current = chainItem;
          dispatch(setWithdrawChainItem(chainItem));
        }
      }
      if (routeQuery.tokenSymbol) {
        newCurrentSymbol = routeQuery.tokenSymbol;
        dispatch(setCurrentSymbol(routeQuery.tokenSymbol));

        newTokenList = await getToken(false);
      } else {
        newTokenList = await getToken(true);
      }

      const newCurrentToken = newTokenList.find((item) => item.symbol === newCurrentSymbol);

      const address = routeQuery.withdrawAddress || withdraw.address || '';
      form.setFieldValue(FormKeys.ADDRESS, address);
      dispatch(setWithdrawAddress(address));

      if (
        withdraw?.currentNetwork?.network &&
        withdraw?.networkList &&
        withdraw.networkList?.length > 0
      ) {
        setCurrentNetwork(withdraw.currentNetwork);
        currentNetworkRef.current = withdraw.currentNetwork;
        setNetworkList(withdraw.networkList);
        form.setFieldValue(FormKeys.NETWORK, withdraw.currentNetwork);

        // get new network data, when refresh page and switch side menu
        await getNetworkData({ symbol: newCurrentSymbol, address });
        getWithdrawData(newCurrentSymbol);
      } else {
        handleChainChanged(currentChainItemRef.current, newCurrentToken);
      }

      console.log('>>>>>> init', newCurrentToken?.symbol);
      getMaxBalanceInterval(newCurrentToken);
    } catch (error) {
      console.log('withdraw init error', error);
    } finally {
      setLoading(false);
    }
  }, [
    currentSymbol,
    dispatch,
    form,
    getMaxBalanceInterval,
    getNetworkData,
    getToken,
    getWithdrawData,
    handleChainChanged,
    routeQuery.chainId,
    routeQuery.tokenSymbol,
    routeQuery.withdrawAddress,
    setAuthFromStorage,
    setLoading,
    tokenList,
    withdraw,
  ]);
  const initRef = useRef(init);
  initRef.current = init;

  const getNetworkDataRef = useRef(getNetworkData);
  getNetworkDataRef.current = getNetworkData;
  const getWithdrawDataRef = useRef(getWithdrawData);
  getWithdrawDataRef.current = getWithdrawData;
  const initForReLogin = useCallback(async () => {
    try {
      setLoading(true);
      const newTokenList = await getToken(true);
      const newCurrentToken = newTokenList.find((item) => item.symbol === currentSymbol);

      const address = form.getFieldValue(FormKeys.ADDRESS) || '';
      dispatch(setWithdrawAddress(address));

      // get new network data
      await getNetworkDataRef.current({ symbol: currentSymbol, address });
      getWithdrawDataRef.current(currentSymbol);

      console.log('>>>>>> initForReLogin', currentSymbol, newCurrentToken?.symbol);
      getMaxBalanceInterval(newCurrentToken);
    } catch (error) {
      console.log('withdraw init error', error);
    } finally {
      setLoading(false);
    }
  }, [currentSymbol, dispatch, form, getMaxBalanceInterval, getToken, setLoading]);

  const initForReLoginRef = useRef(initForReLogin);
  initForReLoginRef.current = initForReLogin;

  const initForLogout = useCallback(async () => {
    dispatch(setWithdrawAddress(''));
    form.setFieldValue(FormKeys.TOKEN, InitialWithdrawState.currentSymbol);
    form.setFieldValue(FormKeys.ADDRESS, '');
    form.setFieldValue(FormKeys.NETWORK, '');
    form.setFieldValue(FormKeys.AMOUNT, '');
    form.setFieldValue(FormKeys.COMMENT, '');
    setCurrentNetwork(undefined);
    currentNetworkRef.current = undefined;
    currentChainItemRef.current = InitialWithdrawState.currentChainItem || CHAIN_LIST[0];
    setNetworkList([]);
    setWithdrawInfo(InitialWithdrawInfo);
    setBalance('0');
    setMaxBalance('');
    setFormValidateData(JSON.parse(JSON.stringify(FORM_VALIDATE_DATA)));

    if (getMaxBalanceTimerRef.current) {
      clearInterval(getMaxBalanceTimerRef.current);
      getMaxBalanceTimerRef.current = null;
    }

    await sleep(200);
    await getToken(false);
    await getNetworkData({ symbol: InitialWithdrawState.currentSymbol, address: '' });
  }, [dispatch, form, getNetworkData, getToken]);

  const initForLogoutRef = useRef(initForLogout);
  initForLogoutRef.current = initForLogout;

  const router = useRouter();
  useEffectOnce(() => {
    // normal init
    dispatch(setActiveMenuKey(SideMenuKey.Withdraw));
    initRef.current();

    router.replace('/withdraw');

    return () => {
      if (getMaxBalanceTimerRef.current) clearInterval(getMaxBalanceTimerRef.current);
    };
  });

  // useEffect(() => {
  //   const { remove } = myEvents.AuthTokenSuccess.addListener(() => {
  //     console.log('login success');
  //     init();
  //   });
  //   return () => {
  //     remove();
  //   };
  // }, [init]);

  useEffect(() => {
    if (!isLogin) {
      setWithdrawInfo(InitialWithdrawInfo);
      setBalance('0');
      setMaxBalance('');
      setFormValidateData(JSON.parse(JSON.stringify(FORM_VALIDATE_DATA)));

      if (getMaxBalanceTimerRef.current) {
        clearInterval(getMaxBalanceTimerRef.current);
        getMaxBalanceTimerRef.current = null;
      }
    }
  }, [isLogin]);

  useEffect(() => {
    // log in
    const { remove: removeLoginSuccess } = myEvents.LoginSuccess.addListener(() =>
      initForReLoginRef.current(),
    );

    // log out \ exit
    const { remove: removeLogoutSuccess } = myEvents.LogoutSuccess.addListener(() =>
      initForLogoutRef.current(),
    );

    return () => {
      removeLoginSuccess();
      removeLogoutSuccess();
    };
  }, []);

  const renderBalance = useMemo(() => {
    return (
      <div
        className={clsx('flex-row-center', styles['info-wrapper'], styles['balance-info-wrapper'])}>
        <div className={styles['info-label']}>Balance</div>
        <div className={styles['info-value']}>
          {!isLogin ? (
            DEFAULT_NULL_VALUE
          ) : !maxBalance || isMaxBalanceLoading ? (
            <PartialLoading />
          ) : (
            `${maxBalance} ${formatSymbolDisplay(currentSymbol)}`
          )}
        </div>
      </div>
    );
  }, [currentSymbol, isLogin, isMaxBalanceLoading, maxBalance]);

  const handleClickProcessingTip = useCallback(() => {
    router.push('/history');
  }, [router]);
  const renderMainContent = useMemo(() => {
    return (
      <div
        className={clsx(
          'main-content-container',
          'main-content-container-safe-area',
          'withdraw-content-container',
          !isPadPX && styles['main-content'],
        )}>
        {!isPadPX && isLogin && (
          <div className={styles['withdraw-processing-container']}>
            <ProcessingTip
              depositProcessingCount={depositProcessingCount}
              withdrawProcessingCount={withdrawProcessingCount}
              onClick={handleClickProcessingTip}
            />
          </div>
        )}
        <SelectChainWrapper
          mobileTitle="Withdraw from"
          mobileLabel="from"
          webLabel={'Withdraw Assets from'}
          chainChanged={(item: IChainNameItem) => handleChainChanged(item)}
        />
        <div className={styles['form-container']}>
          <Form
            className={styles['form-wrapper']}
            layout="vertical"
            requiredMark={false}
            form={form}>
            <div className={styles['form-item-wrapper']}>
              <Form.Item
                className={styles['form-item']}
                label="Withdrawal Token"
                name={FormKeys.TOKEN}
                validateStatus={formValidateData[FormKeys.TOKEN].validateStatus}
                help={formValidateData[FormKeys.TOKEN].errorMessage}>
                <SelectToken
                  selected={currentToken}
                  selectCallback={handleTokenChange}
                  tokenList={tokenList}
                  chainItem={currentChainItem}
                />
              </Form.Item>
            </div>
            <div className={styles['form-item-wrapper']}>
              <Form.Item
                className={styles['form-item']}
                label="Withdrawal Address"
                name={FormKeys.ADDRESS}
                validateStatus={formValidateData[FormKeys.ADDRESS].validateStatus}
                help={formValidateData[FormKeys.ADDRESS].errorMessage}>
                <FormTextarea
                  onChange={onAddressChange}
                  onBlur={onAddressBlur}
                  textareaProps={{
                    placeholder: 'Enter an address',
                  }}
                  autoSize={{ maxRows: 2 }}
                />
              </Form.Item>
            </div>
            <div className={styles['form-item-wrapper']}>
              <Form.Item
                className={styles['form-item']}
                label="Withdrawal Network"
                name={FormKeys.NETWORK}
                validateStatus={formValidateData[FormKeys.NETWORK].validateStatus}
                help={formValidateData[FormKeys.NETWORK].errorMessage}>
                <SelectNetwork
                  networkList={networkList}
                  selected={currentNetwork}
                  isDisabled={isNetworkDisable}
                  isShowLoading={isShowNetworkLoading}
                  selectCallback={handleNetworkChanged}
                />
              </Form.Item>
              {!isPadPX && !!currentNetwork?.contractAddress && (
                <ContractAddressForWeb
                  label={CONTRACT_ADDRESS}
                  address={currentNetwork.contractAddress}
                  explorerUrl={currentNetwork?.explorerUrl}
                />
              )}
            </div>
            {currentNetwork?.network === BlockchainNetworkType.TON && (
              <div className={styles['form-item-wrapper']}>
                <Form.Item
                  className={styles['form-item']}
                  label={<CommentFormItemLabel />}
                  name={FormKeys.COMMENT}
                  validateStatus={formValidateData[FormKeys.COMMENT].validateStatus}
                  help={formValidateData[FormKeys.COMMENT].errorMessage}>
                  <FormInput
                    placeholder="Enter comment"
                    autoComplete="off"
                    onChange={(e) => onCommentChange(e.target.value)}
                    onInput={(event: any) => {
                      const value = event.target?.value?.trim();
                      const oldValue = form.getFieldValue(FormKeys.COMMENT);

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
            <div className={clsx(styles['form-item-wrapper'], styles['amount-form-item-wrapper'])}>
              <Form.Item
                className={styles['form-item']}
                label={
                  <div className={clsx('flex-row-between', styles['form-label-wrapper'])}>
                    <span className={styles['form-label']}>Withdrawal Amount</span>
                    {isLogin && !isPadPX && (
                      <RemainingLimit
                        limitCurrency={withdrawInfo.limitCurrency}
                        totalLimit={withdrawInfo.totalLimit}
                        remainingLimit={withdrawInfo.remainingLimit}
                      />
                    )}
                  </div>
                }
                name={FormKeys.AMOUNT}
                validateStatus={formValidateData[FormKeys.AMOUNT].validateStatus}
                help={formValidateData[FormKeys.AMOUNT].errorMessage}>
                <FormInput
                  unit={withdrawInfo.transactionUnit}
                  maxButtonConfig={
                    isLogin
                      ? {
                          onClick: () => setMaxToken(),
                        }
                      : undefined
                  }
                  autoComplete="off"
                  placeholder={isLogin ? `Minimum: ${minAmount}` : ''}
                  onInput={(event: any) => {
                    const value = event.target?.value?.trim();
                    const oldValue = form.getFieldValue(FormKeys.AMOUNT);

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
                    setBalance(valueNotComma || '');
                  }}
                  onBlur={() => {
                    if (handleAmountValidate()) {
                      getWithdrawData();
                    }
                  }}
                />
              </Form.Item>
            </div>

            {renderBalance}

            {isLogin && isPadPX && (
              <RemainingLimit
                limitCurrency={withdrawInfo.limitCurrency}
                totalLimit={withdrawInfo.totalLimit}
                remainingLimit={withdrawInfo.remainingLimit}
              />
            )}
            {isPadPX && currentNetwork?.contractAddress && (
              <ContractAddressForMobile
                label={CONTRACT_ADDRESS}
                networkName={currentNetwork.name}
                address={currentNetwork.contractAddress}
                explorerUrl={currentNetwork?.explorerUrl}
              />
            )}
            <WithdrawFooter
              isTransactionFeeLoading={isTransactionFeeLoading}
              isSubmitDisabled={isSubmitDisabled}
              currentNetwork={currentNetwork}
              receiveAmount={receiveAmount}
              address={getAddressInput()}
              memo={getCommentInput()}
              balance={balance}
              withdrawInfo={withdrawInfo}
              clickFailedOk={clickFailedOk}
              clickSuccessOk={clickSuccessOk}
            />
          </Form>
        </div>
      </div>
    );
  }, [
    balance,
    clickFailedOk,
    clickSuccessOk,
    currentChainItem,
    currentNetwork,
    currentToken,
    currentTokenDecimal,
    depositProcessingCount,
    form,
    formValidateData,
    getAddressInput,
    getCommentInput,
    getWithdrawData,
    handleAmountValidate,
    handleChainChanged,
    handleClickProcessingTip,
    handleNetworkChanged,
    handleTokenChange,
    isAndroid,
    isLogin,
    isNetworkDisable,
    isPadPX,
    isShowNetworkLoading,
    isSubmitDisabled,
    isTransactionFeeLoading,
    minAmount,
    networkList,
    onAddressBlur,
    onAddressChange,
    onCommentChange,
    receiveAmount,
    renderBalance,
    setMaxToken,
    tokenList,
    withdrawInfo,
    withdrawProcessingCount,
  ]);

  return (
    <>
      {isPadPX && isLogin && (
        <ProcessingTip
          depositProcessingCount={depositProcessingCount}
          withdrawProcessingCount={withdrawProcessingCount}
          marginBottom={isPadPX && !isMobilePX ? 24 : 16}
          borderRadius={0}
          onClick={handleClickProcessingTip}
        />
      )}
      <div className={clsx('content-container', !isPadPX && 'flex-row')}>
        <div className={clsx(styles['section'], !isMobilePX && styles['main-wrapper'])}>
          {renderMainContent}
        </div>
        {!isPadPX && (
          <div className={clsx('flex-row', styles['faq-wrapper'])}>
            <div className={styles['faq-left']}></div>
            <FAQ className={styles['faq']} title={FAQ_WITHDRAW.title} list={FAQ_WITHDRAW.list} />
          </div>
        )}
        {isPadPX && !isMobilePX && (
          <>
            <div className={styles['divider']} />
            <FAQ
              className={clsx(styles['section'], styles['faq'])}
              title={FAQ_WITHDRAW.title}
              list={FAQ_WITHDRAW.list}
            />
          </>
        )}
      </div>
    </>
  );
}
