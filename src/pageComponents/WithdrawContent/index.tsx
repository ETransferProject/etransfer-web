/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Form, Tooltip } from 'antd';
import clsx from 'clsx';
import SelectChainWrapper from 'pageComponents/SelectChainWrapper';
import CommonButton from 'components/CommonButton';
import FormTextarea from 'components/FormTextarea';
import CommonLink from 'components/CommonLink';
import SelectNetwork from 'pageComponents/SelectNetwork';
import SelectToken from 'pageComponents/SelectToken';
import DoubleCheckModal from './DoubleCheckModal';
import SuccessModal from './SuccessModal';
import FailModal from './FailModal';
import {
  NetworkItem,
  WithdrawInfo,
  GetNetworkListRequest,
  BusinessType,
  GetWithdrawInfoRequest,
  TokenItem,
  NetworkStatus,
} from 'types/api';
import {
  useAppDispatch,
  useCommonState,
  useLoading,
  useUserActionState,
} from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { ADDRESS_MAP, IChainNameItem } from 'constants/index';
import { createWithdrawOrder, getNetworkList, getWithdrawInfo } from 'utils/api/deposit';
import {
  CONTRACT_ADDRESS,
  initialWithdrawInfo,
  initialWithdrawSuccessCheck,
} from 'constants/deposit';
import { WithdrawInfoSuccess } from 'types/deposit';
import {
  checkTokenAllowanceAndApprove,
  createTransferTokenTransaction,
  getBalance,
} from 'utils/aelfUtils';
import singleMessage from 'components/SingleMessage';
import { divDecimals, timesDecimals } from 'utils/calculate';
import { ZERO } from 'constants/misc';
import portkeyContractUnity from 'contract/portkey';
import { ContractType } from 'constants/chain';
import BigNumber from 'bignumber.js';
import { SideMenuKey } from 'constants/home';
import {
  setWithdrawAddress,
  setWithdrawCurrentNetwork,
  setWithdrawNetworkList,
} from 'store/reducers/userAction/slice';
import { useDebounceCallback } from 'hooks';
import { useEffectOnce } from 'react-use';
import SimpleLoading from 'components/SimpleLoading';
import {
  AmountGreaterThanBalanceMessage,
  DefaultWithdrawErrorMessage,
  ErrorNameType,
  InsufficientAllowanceMessage,
  WithdrawAddressErrorCodeList,
  WithdrawSendTxErrorCodeList,
  RemainingWithdrawalQuotaTooltip,
} from 'constants/withdraw';
import { CommonErrorNameType } from 'api/types';
import { ContractAddressForMobile, ContractAddressForWeb } from './ContractAddress';
import { handleErrorMessage } from '@portkey/did-ui-react';
import { useAccounts } from 'hooks/portkeyWallet';
import getPortkeyWallet from 'wallet/portkeyWallet';
import FormInput from 'pageComponents/WithdrawContent/FormAmountInput';
import { formatWithCommas, parseWithCommas, parseWithStringCommas } from 'utils/format';
import { sleep, getExploreLink } from 'utils/common';
import { devices } from '@portkey/utils';
import { ConnectWalletError } from 'constants/wallet';
import { useWithdraw } from 'hooks/withdraw';
import { QuestionMarkIcon, Fingerprint } from 'assets/images';
import { InitWithdrawTokenState } from 'store/reducers/token/slice';
import RemainingQuato from './RemainingQuato';
import { getRecordStatus } from 'utils/api/records';
import { compareTwoStringNumbers } from 'utils/calculate';
import { setIsShowRedDot, setRecordCreateTime } from 'store/reducers/common/slice';

enum ValidateStatus {
  Error = 'error',
  Warning = 'warning',
  Normal = '',
}

enum FormKeys {
  TOKEN = 'token',
  ADDRESS = 'address',
  NETWORK = 'network',
  AMOUNT = 'amount',
}

type FormValuesType = {
  [FormKeys.TOKEN]: string;
  [FormKeys.ADDRESS]: string;
  [FormKeys.NETWORK]: NetworkItem;
  [FormKeys.AMOUNT]: string;
};

export default function WithdrawContent() {
  const dispatch = useAppDispatch();
  const isAndroid = devices.isMobile().android;
  const { isMobilePX, currentChainItem, currentVersion, activeMenuKey, recordCreateTime } =
    useCommonState();
  const currentChainItemRef = useRef<IChainNameItem>(currentChainItem);
  const accounts = useAccounts();
  const { currentSymbol, tokenList } = useWithdraw();
  const { withdraw } = useUserActionState();
  const { setLoading } = useLoading();
  const [isShowNetworkLoading, setIsShowNetworkLoading] = useState(false);
  const [networkList, setNetworkList] = useState<NetworkItem[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkItem>();
  const currentNetworkRef = useRef<NetworkItem>();
  const [form] = Form.useForm<FormValuesType>();
  const [withdrawInfo, setWithdrawInfo] = useState<WithdrawInfo>(initialWithdrawInfo);
  const [balance, setBalance] = useState('0');
  const [maxBalance, setMaxBalance] = useState('0');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isDoubleCheckModalOpen, setIsDoubleCheckModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [failModalReason, setFailModalReason] = useState('');
  const [withdrawInfoSuccess, setWithdrawInfoSuccessCheck] = useState<WithdrawInfoSuccess>(
    initialWithdrawSuccessCheck,
  );
  const [isNetworkDisable, setIsNetworkDisable] = useState(false);
  const [formValidateData, setFormValidateData] = useState<{
    [key in FormKeys]: { validateStatus: ValidateStatus; errorMessage: string };
  }>({
    [FormKeys.TOKEN]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
    [FormKeys.ADDRESS]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
    [FormKeys.NETWORK]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
    [FormKeys.AMOUNT]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
  });
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
    if (Array.isArray(tokenList) && tokenList.length > 0) {
      return tokenList.find((item) => item.symbol === currentSymbol) as TokenItem;
    }
    return InitWithdrawTokenState.tokenList[0];
  }, [currentSymbol, tokenList]);

  const currentTokenDecimal = useMemo(() => currentToken.decimals, [currentToken.decimals]);

  const currentTokenAddress = useMemo(
    () => currentToken.contractAddress,
    [currentToken.contractAddress],
  );

  const onSubmit = () => {
    if (!currentNetwork) return;
    setIsDoubleCheckModalOpen(true);
  };

  const remainingLimitComponent = useMemo(() => {
    return (
      <div
        className={clsx('flex-row-center', styles['remaining-limit-wrapper'], {
          [styles['remaining-limit-error']]:
            withdrawInfo.remainingLimit !== null &&
            withdrawInfo.remainingLimit !== undefined &&
            withdrawInfo.remainingLimit !== '' &&
            new BigNumber(withdrawInfo.remainingLimit).isEqualTo(0),
        })}>
        <span className={styles['remaining-limit-value']}>
          {withdrawInfo.remainingLimit && withdrawInfo.totalLimit ? (
            <>
              {`${new BigNumber(withdrawInfo.remainingLimit).toFormat()} /
               ${new BigNumber(withdrawInfo.totalLimit).toFormat()}`}
              <span className={styles['remaining-limit-value-limitcurrency']}>
                {withdrawInfo.limitCurrency}
              </span>
            </>
          ) : (
            '--'
          )}
          <RemainingQuato title={RemainingWithdrawalQuotaTooltip}></RemainingQuato>
        </span>
        <span className={styles['remaining-limit-label']}>
          {isMobilePX && '• 24-Hour Limit：'}
          {!isMobilePX && (
            <Tooltip
              className={clsx(styles['question-label'])}
              placement="top"
              title={RemainingWithdrawalQuotaTooltip}>
              24-Hour Limit <QuestionMarkIcon />
            </Tooltip>
          )}
        </span>
      </div>
    );
  }, [
    withdrawInfo.remainingLimit,
    withdrawInfo.totalLimit,
    withdrawInfo.limitCurrency,
    isMobilePX,
  ]);

  const judgeIsSubmitDisabled = useCallback(
    (currentFormValidateData: typeof formValidateData) => {
      const isValueUndefined = (value: unknown) => value === undefined || value === '';
      const isDisabled =
        currentFormValidateData[FormKeys.ADDRESS].validateStatus === ValidateStatus.Error ||
        currentFormValidateData[FormKeys.NETWORK].validateStatus === ValidateStatus.Error ||
        currentFormValidateData[FormKeys.AMOUNT].validateStatus === ValidateStatus.Error ||
        isValueUndefined(form.getFieldValue(FormKeys.ADDRESS)) ||
        isValueUndefined(currentNetworkRef.current) ||
        isValueUndefined(form.getFieldValue(FormKeys.AMOUNT));
      setIsSubmitDisabled(isDisabled);
    },
    [form],
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
    async ({ symbol, address }: Omit<GetNetworkListRequest, 'type' | 'chainId'>) => {
      try {
        setIsShowNetworkLoading(true);
        const params: GetNetworkListRequest = {
          type: BusinessType.Withdraw,
          chainId: currentChainItemRef.current.key,
          symbol: symbol,
        };
        if (address) {
          params.address = address;
        }

        const { networkList } = await getNetworkList(params);
        setNetworkList(networkList);
        dispatch(setWithdrawNetworkList(networkList));

        if (networkList?.length === 1 && networkList[0].status !== NetworkStatus.Offline) {
          setCurrentNetwork(networkList[0]);
          currentNetworkRef.current = networkList[0];
          dispatch(setWithdrawCurrentNetwork(networkList[0]));
        } else {
          const exitNetwork = networkList.filter(
            (item) => item.network === currentNetworkRef.current?.network,
          );
          if (exitNetwork?.length === 0) {
            setCurrentNetwork(undefined);
            currentNetworkRef.current = undefined;
            dispatch(setWithdrawCurrentNetwork(undefined));
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
          if (error.name !== CommonErrorNameType.CANCEL) {
            singleMessage.error(handleErrorMessage(error));
          }
          setNetworkList([]);
        }
        dispatch(setWithdrawNetworkList([]));
        setCurrentNetwork(undefined);
        currentNetworkRef.current = undefined;
        dispatch(setWithdrawCurrentNetwork(undefined));
      } finally {
        setIsShowNetworkLoading(false);
      }
    },
    [dispatch, getAllNetworkData, handleFormValidateDataChange],
  );

  const handleAmountValidate = useCallback(
    (newMinAmount?: string, newTransactionUnit?: string) => {
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
      const currentTransactionUnit = newTransactionUnit || withdrawInfo.transactionUnit;
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
      } else if (parserNumber > Number(parseWithCommas(maxBalance))) {
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
    async (item?: TokenItem) => {
      const symbol = item?.symbol || currentSymbol;
      try {
        setIsTransactionFeeLoading(true);
        const params: GetWithdrawInfoRequest = {
          chainId: currentChainItemRef.current.key,
          symbol,
          version: currentVersion,
        };
        if (currentNetworkRef.current?.network) {
          params.network = currentNetworkRef.current?.network;
        }
        // params add amount to get amountUsd、receiveAmountUsd
        const amount = form.getFieldValue(FormKeys.AMOUNT);
        if (amount) {
          params.amount = amount;
        }

        const res = await getWithdrawInfo(params);

        setWithdrawInfo(res.withdrawInfo);
        setIsTransactionFeeLoading(false);

        handleAmountValidate(res.withdrawInfo?.minAmount, res.withdrawInfo?.transactionUnit);
      } catch (error: any) {
        // when network error, transactionUnit should as the same with symbol
        setWithdrawInfo({ ...initialWithdrawInfo, transactionUnit: symbol });
        if (error.name !== CommonErrorNameType.CANCEL) {
          singleMessage.error(handleErrorMessage(error));
          setIsTransactionFeeLoading(false);
        }
      }
    },
    [currentSymbol, currentVersion, form, handleAmountValidate],
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
    async (item?: TokenItem) => {
      try {
        const symbol = item?.symbol || currentSymbol;
        const decimal = item?.decimals || currentTokenDecimal;
        const caAddress = accounts?.[currentChainItemRef.current.key]?.[0];
        if (!caAddress || !currentVersion) return '';
        const maxBalance = await getBalance({
          symbol: symbol,
          chainId: currentChainItemRef.current.key,
          caAddress,
          version: currentVersion,
        });
        const tempMaxBalance = divDecimals(maxBalance, decimal).toFixed();
        setMaxBalance(tempMaxBalance);
        return tempMaxBalance;
      } catch (error) {
        singleMessage.error(handleErrorMessage(error));
        throw new Error('Failed to get balance.');
      }
    },
    [accounts, currentSymbol, currentTokenDecimal, currentVersion],
  );

  const getMaxBalanceInterval = useCallback(
    async (item?: TokenItem) => {
      if (getMaxBalanceTimerRef.current) clearInterval(getMaxBalanceTimerRef.current);
      getMaxBalanceTimerRef.current = setInterval(async () => {
        await getMaxBalance(item);
      }, 8000);
    },
    [getMaxBalance],
  );

  const handleChainChanged = useCallback(
    async (item: IChainNameItem) => {
      try {
        setLoading(true);
        currentChainItemRef.current = item;
        // dispatch(setWithdrawAddress(''));
        // form.setFieldValue(FormKeys.ADDRESS, '');
        setBalance('');
        form.setFieldValue(FormKeys.AMOUNT, '');
        handleAmountValidate();

        // reset max balance
        getMaxBalanceInterval();
        getMaxBalance();

        await getNetworkData({
          symbol: currentSymbol,
          address: form.getFieldValue(FormKeys.ADDRESS) || undefined,
        });
        await getWithdrawData();
      } catch (error) {
        console.log('Change chain error: ', error);
      } finally {
        setLoading(false);
      }
    },
    [
      currentSymbol,
      form,
      getMaxBalance,
      getMaxBalanceInterval,
      getNetworkData,
      getWithdrawData,
      handleAmountValidate,
      setLoading,
    ],
  );

  useEffect(() => {
    if (!withdrawInfo.expiredTimestamp || currentNetworkRef.current?.network) {
      return;
    }
    if (getTransactionFeeTimerRef.current) {
      clearInterval(getTransactionFeeTimerRef.current);
    }
    getTransactionFeeTimerRef.current = setInterval(async () => {
      if (new Date().getTime() > withdrawInfo.expiredTimestamp) {
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
    async (item: NetworkItem) => {
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

  const handleApproveToken = useCallback(async () => {
    if (!currentVersion) throw new Error(ConnectWalletError);
    const tokenContract = await portkeyContractUnity.getContract({
      chainId: currentChainItemRef.current.key,
      contractType: ContractType.TOKEN,
      version: currentVersion,
    });

    const newMaxBalance = await getMaxBalance();
    console.log('🌈 🌈 🌈 🌈 🌈 🌈 newMaxBalance ', newMaxBalance);
    if (ZERO.plus(newMaxBalance).isLessThan(ZERO.plus(balance))) {
      const error = new Error(
        `Insufficient ${currentSymbol} balance in your account. Please consider transferring a smaller amount or topping up before you try again.`,
      );
      error.name = ErrorNameType.FAIL_MODAL_REASON;
      throw error;
    }

    const ownerAddress = accounts?.[currentChainItemRef.current.key]?.[0] || '';

    const checkRes = await checkTokenAllowanceAndApprove({
      tokenContract,
      symbol: currentSymbol,
      address: ownerAddress,
      approveTargetAddress: currentTokenAddress,
      amount: balance,
    });

    return checkRes;
  }, [accounts, balance, currentSymbol, currentTokenAddress, currentVersion, getMaxBalance]);

  const fetchRecordStatus = useCallback(async () => {
    const res = await getRecordStatus();
    if (!res.status || activeMenuKey === SideMenuKey.Records) {
      dispatch(setIsShowRedDot(false));
      return;
    }

    if (compareTwoStringNumbers(res.createTime, recordCreateTime)) {
      dispatch(setIsShowRedDot(true));
      dispatch(setRecordCreateTime(res.createTime));
    }
  }, [activeMenuKey, dispatch, recordCreateTime]);

  const handleCreateWithdrawOrder = useCallback(
    async ({ address, rawTransaction }: { address: string; rawTransaction: string }) => {
      try {
        if (!currentNetworkRef.current?.network) throw new Error('Please selected network');

        const createWithdrawOrderRes = await createWithdrawOrder({
          network: currentNetworkRef.current.network,
          symbol: currentSymbol,
          amount: balance,
          fromChainId: currentChainItemRef.current.key,
          toAddress: address,
          rawTransaction: rawTransaction,
        });
        console.log('🌈 🌈 🌈 🌈 🌈 🌈 createWithdrawOrderRes', createWithdrawOrderRes);
        if (createWithdrawOrderRes.orderId) {
          setWithdrawInfoSuccessCheck({
            receiveAmount: receiveAmount,
            network: currentNetworkRef.current,
            amount: balance,
            symbol: currentSymbol,
            chainItem: currentChainItemRef.current,
            arriveTime: currentNetworkRef.current.multiConfirmTime,
            receiveAmountUsd: withdrawInfo.receiveAmountUsd,
            transactionId: createWithdrawOrderRes.transactionId,
          });
          setIsSuccessModalOpen(true);
        } else {
          setFailModalReason(DefaultWithdrawErrorMessage);
          setIsFailModalOpen(true);
        }
      } catch (error: any) {
        if (WithdrawSendTxErrorCodeList.includes(error?.code)) {
          setFailModalReason(error?.message);
        } else {
          setFailModalReason(DefaultWithdrawErrorMessage);
        }
        setIsFailModalOpen(true);
      } finally {
        // update records status
        fetchRecordStatus();
        setLoading(false);
        setIsDoubleCheckModalOpen(false);
      }
    },
    [
      balance,
      currentSymbol,
      receiveAmount,
      setLoading,
      withdrawInfo.receiveAmountUsd,
      fetchRecordStatus,
    ],
  );

  const sendTransferTokenTransaction = useDebounceCallback(async () => {
    try {
      if (!currentVersion) throw new Error(ConnectWalletError);
      setLoading(true, { text: 'Please approve the transaction in the wallet...' });
      const address = form.getFieldValue(FormKeys.ADDRESS);
      if (!address) throw new Error('Please enter a correct address.');

      const approveRes = await handleApproveToken();
      if (!approveRes) throw new Error(InsufficientAllowanceMessage);
      console.log('🌈 🌈 🌈 🌈 🌈 🌈 approveRes', approveRes);

      if (approveRes) {
        const portkeyWallet = getPortkeyWallet(currentVersion);
        if (!portkeyWallet?.manager?.caAddress) throw new Error('no caContractAddress');
        if (!portkeyWallet?.caHash) throw new Error('no caHash');

        const transaction = await createTransferTokenTransaction({
          caContractAddress:
            ADDRESS_MAP[currentVersion][currentChainItemRef.current.key][ContractType.CA],
          eTransferContractAddress: currentTokenAddress,
          caHash: portkeyWallet.caHash,
          symbol: currentSymbol,
          amount: timesDecimals(balance, currentTokenDecimal).toFixed(),
          chainId: currentChainItemRef.current.key,
          version: currentVersion,
        });
        console.log(transaction, '=====transaction');

        await handleCreateWithdrawOrder({ address, rawTransaction: transaction });
      } else {
        throw new Error('Approve Failed');
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error?.code == 4001) {
        setFailModalReason('The request is rejected. ETransfer needs your permission to proceed.');
      } else if (error.name === ErrorNameType.FAIL_MODAL_REASON) {
        setFailModalReason(error.message);
      } else {
        setFailModalReason(DefaultWithdrawErrorMessage);
      }
      console.log('sendTransferTokenTransaction error:', error);
      setIsFailModalOpen(true);
    } finally {
      setIsDoubleCheckModalOpen(false);
    }
  }, [balance, currentSymbol, currentTokenAddress, handleApproveToken, receiveAmount, setLoading]);

  const setMaxToken = useCallback(async () => {
    setBalance(maxBalance);
    form.setFieldValue(FormKeys.AMOUNT, maxBalance);
    handleAmountValidate();
  }, [form, maxBalance, handleAmountValidate]);

  const onAddressBlur = useCallback(async () => {
    const address = form.getFieldValue(FormKeys.ADDRESS);
    dispatch(setWithdrawAddress(address));

    if (!address) {
      handleFormValidateDataChange({
        [FormKeys.ADDRESS]: {
          validateStatus: ValidateStatus.Normal,
          errorMessage: '',
        },
      });
      await getNetworkData({
        symbol: currentSymbol,
        address: address,
      });
      await getWithdrawData();
      return;
    } else if (address.length < 32 || address.length > 44) {
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

    await getNetworkData({
      symbol: currentSymbol,
      address: address,
    });

    await getWithdrawData();
  }, [
    currentSymbol,
    dispatch,
    form,
    getAllNetworkData,
    getNetworkData,
    getWithdrawData,
    handleFormValidateDataChange,
  ]);

  const handleTokenChange = async (item: TokenItem) => {
    // when network failed, transactionUnit should show as symbol
    setWithdrawInfo({ ...withdrawInfo, transactionUnit: item.symbol });

    try {
      setLoading(true);
      setBalance('');

      // change token and empty form key's value
      form.setFieldValue(FormKeys.AMOUNT, '');
      form.setFieldValue(FormKeys.ADDRESS, '');
      form.setFieldValue(FormKeys.NETWORK, '');
      handleAmountValidate();
      dispatch(setWithdrawAddress(''));
      currentNetworkRef.current = undefined;
      dispatch(setWithdrawCurrentNetwork(undefined));

      // reset max balance
      getMaxBalanceInterval(item);
      getMaxBalance(item);

      await getNetworkData({
        symbol: item.symbol,
        address: form.getFieldValue(FormKeys.ADDRESS) || undefined,
      });
      await getWithdrawData(item);
    } finally {
      setLoading(false);
    }
  };

  const onAddressChange = useCallback(
    (value: string | null) => {
      dispatch(setWithdrawAddress(value || ''));
    },
    [dispatch],
  );

  const clickSuccessOk = useCallback(() => {
    setIsSuccessModalOpen(false);
    setBalance('');
    form.setFieldValue(FormKeys.AMOUNT, '');

    getWithdrawData();
  }, [form, getWithdrawData]);

  const clickFailedOk = useCallback(() => {
    setIsFailModalOpen(false);
    setBalance('');
    form.setFieldValue(FormKeys.AMOUNT, '');

    getWithdrawData();
  }, [form, getWithdrawData]);

  useEffectOnce(() => {
    form.setFieldValue(FormKeys.ADDRESS, withdraw.address || '');

    if (
      withdraw?.currentNetwork?.network &&
      withdraw?.networkList &&
      withdraw.networkList?.length > 0
    ) {
      setCurrentNetwork(withdraw.currentNetwork);
      currentNetworkRef.current = withdraw.currentNetwork;
      setNetworkList(withdraw.networkList);
      form.setFieldValue(FormKeys.NETWORK, withdraw.currentNetwork);

      getWithdrawData();
    } else {
      handleChainChanged(currentChainItemRef.current);
    }

    // interval fetch balance
    getMaxBalanceInterval();
    return () => {
      if (getMaxBalanceTimerRef.current) clearInterval(getMaxBalanceTimerRef.current);
    };
  });

  const renderTransactionFeeValue = () => {
    if (!withdrawInfo.transactionFee || !withdrawInfo.aelfTransactionFee) {
      return isTransactionFeeLoading ? <SimpleLoading /> : '--';
    } else {
      return (
        <>
          {isTransactionFeeLoading && <SimpleLoading />}
          <span className={styles['transaction-fee-value-data']}>
            {!isTransactionFeeLoading &&
              `${(!isSuccessModalOpen && withdrawInfo.transactionFee) || '--'} `}
            <span
              className={clsx(
                styles['transaction-fee-value-data-default'],
                styles['transaction-fee-value-data-unit'],
              )}>
              {withdrawInfo.transactionUnit}
            </span>
            + {(!isSuccessModalOpen && withdrawInfo.aelfTransactionFee) || '--'}
            {withdrawInfo.aelfTransactionUnit}
          </span>
        </>
      );
    }
  };

  return (
    <>
      <SelectChainWrapper
        mobileTitle="Withdraw from"
        mobileLabel="from"
        webLabel={'Withdraw Assets from'}
        chainChanged={(item: IChainNameItem) => handleChainChanged(item)}
      />
      <div>
        <Form className={styles['form-wrapper']} layout="vertical" requiredMark={false} form={form}>
          <div className={styles['form-item-wrapper']}>
            <Form.Item
              className={styles['form-item']}
              label="Withdrawal Assets"
              name={FormKeys.TOKEN}
              validateStatus={formValidateData[FormKeys.TOKEN].validateStatus}
              help={formValidateData[FormKeys.TOKEN].errorMessage}>
              <SelectToken
                isFormItemStyle
                type={SideMenuKey.Withdraw}
                selected={currentToken}
                selectCallback={handleTokenChange}
                tokenList={tokenList}
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
                isFormItemStyle
                type={SideMenuKey.Withdraw}
                networkList={networkList}
                selected={currentNetwork}
                isDisabled={isNetworkDisable}
                isShowLoading={isShowNetworkLoading}
                selectCallback={handleNetworkChanged}
              />
            </Form.Item>
            {!isMobilePX && !!currentNetwork?.contractAddress && (
              <ContractAddressForWeb
                label={CONTRACT_ADDRESS}
                address={currentNetwork.contractAddress}
                explorerUrl={currentNetwork?.explorerUrl}
              />
            )}
          </div>
          <div className={clsx(styles['form-item-wrapper'], styles['amount-form-item-wrapper'])}>
            <Form.Item
              className={styles['form-item']}
              label={
                <div className={clsx('flex-row-between', styles['form-label-wrapper'])}>
                  <span className={styles['form-label']}>Withdrawal Amount</span>
                  {!isMobilePX && remainingLimitComponent}
                </div>
              }
              name={FormKeys.AMOUNT}
              validateStatus={formValidateData[FormKeys.AMOUNT].validateStatus}
              help={formValidateData[FormKeys.AMOUNT].errorMessage}>
              <FormInput
                unit={withdrawInfo.transactionUnit}
                maxButtonConfig={{
                  onClick: () => setMaxToken(),
                }}
                autoComplete="off"
                placeholder={`Minimum: ${minAmount}`}
                onInput={(event: any) => {
                  const value = event.target?.value.trim();
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
                  if (isAndroid) {
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
          <div
            className={clsx(
              'flex-row-center',
              styles['info-wrapper'],
              styles['balance-info-wrapper'],
            )}>
            <div className={styles['info-label']}>Balance</div>
            <div className={styles['info-value']}>
              {maxBalance} {withdrawInfo.transactionUnit}
            </div>
          </div>
          {isMobilePX && remainingLimitComponent}
          {isMobilePX && currentNetwork?.contractAddress && (
            <ContractAddressForMobile
              label={CONTRACT_ADDRESS}
              networkName={currentNetwork.name}
              address={currentNetwork.contractAddress}
              explorerUrl={currentNetwork?.explorerUrl}
            />
          )}
          <div className={clsx(styles['form-footer'], styles['form-footer-safe-area'])}>
            <div className={clsx('flex-1', 'flex-column', styles['footer-info-wrapper'])}>
              <div
                className={clsx(
                  'flex-row-center',
                  styles['info-wrapper'],
                  styles['transaction-fee-wrapper'],
                )}>
                <div className={styles['info-label']}>Transaction Fee: </div>
                <div className={clsx('flex-row-center', styles['info-value'])}>
                  {renderTransactionFeeValue()}
                </div>
              </div>
              <div className={clsx('flex-column', styles['receive-amount-wrapper'])}>
                <div className={styles['info-label']}>Amount to Be Received</div>
                <div
                  className={clsx(
                    'flex-row-center',
                    styles['info-value'],
                    styles['info-value-big-font'],
                  )}>
                  {isTransactionFeeLoading && <SimpleLoading />}
                  {!isTransactionFeeLoading && `${(!isSuccessModalOpen && receiveAmount) || '--'} `}
                  <span className={clsx(styles['info-unit'])}>{withdrawInfo.transactionUnit}</span>
                </div>
              </div>
            </div>
            <Form.Item
              shouldUpdate
              className={clsx('flex-none', styles['form-submit-button-wrapper'])}>
              <CommonButton
                className={styles['form-submit-button']}
                // htmlType="submit"
                onClick={onSubmit}
                disabled={isTransactionFeeLoading || !receiveAmount || isSubmitDisabled}>
                Withdraw
              </CommonButton>
            </Form.Item>
          </div>
        </Form>
      </div>
      <DoubleCheckModal
        withdrawInfo={{
          receiveAmount,
          address: form.getFieldValue(FormKeys.ADDRESS),
          network: currentNetwork,
          amount: balance,
          transactionFee: {
            amount: withdrawInfo.transactionFee,
            currency: withdrawInfo.transactionUnit,
            name: withdrawInfo.transactionUnit,
          },
          aelfTransactionFee: {
            amount: withdrawInfo.aelfTransactionFee,
            currency: withdrawInfo.aelfTransactionUnit,
            name: withdrawInfo.aelfTransactionUnit,
          },
          symbol: currentSymbol,
          amountUsd: withdrawInfo.amountUsd,
          receiveAmountUsd: withdrawInfo.receiveAmountUsd,
          feeUsd: withdrawInfo.feeUsd,
        }}
        modalProps={{
          open: isDoubleCheckModalOpen,
          onClose: () => setIsDoubleCheckModalOpen(false),
          onOk: () => {
            setIsDoubleCheckModalOpen(false);
            sendTransferTokenTransaction();
          },
        }}
        isTransactionFeeLoading={isTransactionFeeLoading}
      />
      <SuccessModal
        withdrawInfo={withdrawInfoSuccess}
        modalProps={{
          open: isSuccessModalOpen,
          onClose: clickSuccessOk,
          onOk: clickSuccessOk,
          linkToExplore: CommonLink({
            href: getExploreLink(
              withdrawInfoSuccess.transactionId,
              'transaction',
              currentChainItemRef.current.key,
            ),
            isTagA: true,
            children: (
              <div className={styles['link-wrap']}>
                <span className={styles['link-word']}>View on aelf Explorer</span>
                <Fingerprint className={styles['link-explore-icon']} />
              </div>
            ),
          }),
        }}
      />
      <FailModal
        failReason={failModalReason}
        modalProps={{
          open: isFailModalOpen,
          onClose: clickFailedOk,
          onOk: clickFailedOk,
        }}
      />
    </>
  );
}
