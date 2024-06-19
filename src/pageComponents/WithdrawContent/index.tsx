/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Form, Tooltip } from 'antd';
import clsx from 'clsx';
import SelectChainWrapper from 'pageComponents/WithdrawContent/SelectChainWrapper';
import CommonButton from 'components/CommonButton';
import FormTextarea from 'components/FormTextarea';
import CommonLink from 'components/CommonLink';
import SelectToken from './SelectToken';
import SelectNetwork from './SelectNetwork';
import DoubleCheckModal from './DoubleCheckModal';
import SuccessModal from './SuccessModal';
import FailModal from './FailModal';
import {
  TNetworkItem,
  TWithdrawInfo,
  TGetNetworkListRequest,
  BusinessType,
  TGetWithdrawInfoRequest,
  TTokenItem,
  NetworkStatus,
} from 'types/api';
import { useAppDispatch, useCommonState, useLoading, useWithdrawState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { ADDRESS_MAP, CHAIN_LIST, IChainNameItem, defaultNullValue } from 'constants/index';
import {
  createWithdrawOrder,
  getNetworkList,
  getTokenList,
  getWithdrawInfo,
} from 'utils/api/deposit';
import { CONTRACT_ADDRESS } from 'constants/deposit';
import { TWithdrawInfoSuccess } from 'types/deposit';
import {
  checkTokenAllowanceAndApprove,
  createTransferTokenTransaction,
  getBalance,
} from 'utils/contract';
import singleMessage from 'components/SingleMessage';
import { divDecimals, timesDecimals } from 'utils/calculate';
import { ZERO } from 'constants/calculate';
import { ContractType } from 'constants/chain';
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
import { useDebounceCallback } from 'hooks/debounce';
import { useEffectOnce } from 'react-use';
import PartialLoading from 'components/PartialLoading';
import {
  AmountGreaterThanBalanceMessage,
  DefaultWithdrawErrorMessage,
  ErrorNameType,
  InitialWithdrawInfo,
  InitialWithdrawSuccessCheck,
  InsufficientAllowanceMessage,
  WithdrawAddressErrorCodeList,
  WithdrawSendTxErrorCodeList,
  RemainingWithdrawalQuotaTooltip,
} from 'constants/withdraw';
import { CommonErrorNameType } from 'api/types';
import { ContractAddressForMobile, ContractAddressForWeb } from './ContractAddress';
import { handleErrorMessage } from '@portkey/did-ui-react';
import { useAccounts } from 'hooks/portkeyWallet';
import FormInput from 'pageComponents/WithdrawContent/FormAmountInput';
import {
  formatSymbolDisplay,
  formatWithCommas,
  parseWithCommas,
  parseWithStringCommas,
} from 'utils/format';
import { getAelfExploreLink } from 'utils/common';
import { devices, sleep } from '@portkey/utils';
import { useWithdraw } from 'hooks/withdraw';
import { QuestionMarkIcon, Fingerprint } from 'assets/images';
import RemainingQuota from './RemainingQuota';
import { useWalletContext } from 'provider/walletProvider';
import { isAuthTokenError, isHtmlError } from 'utils/api/error';
import myEvents from 'utils/myEvent';
import { useCurrentVersion } from 'hooks/common';
import { AelfExploreType } from 'constants/network';
import { isDIDAddressSuffix, removeAddressSuffix, removeELFAddressSuffix } from 'utils/aelfBase';
import { SideMenuKey } from 'constants/home';
import FeeInfo from './FeeInfo';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet } from 'utils/wallet';
import { WalletType } from 'aelf-web-login';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import FAQ from 'components/FAQ';
import { FAQ_WITHDRAW } from 'constants/footer';

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

type TFormValues = {
  [FormKeys.TOKEN]: string;
  [FormKeys.ADDRESS]: string;
  [FormKeys.NETWORK]: TNetworkItem;
  [FormKeys.AMOUNT]: string;
};

export default function WithdrawContent() {
  const dispatch = useAppDispatch();
  const isAndroid = devices.isMobile().android;
  const { isPadPX } = useCommonState();
  const currentVersion = useCurrentVersion();
  const withdraw = useWithdrawState();
  const accounts = useAccounts();
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
  const [isDoubleCheckModalOpen, setIsDoubleCheckModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [failModalReason, setFailModalReason] = useState('');
  const [withdrawInfoSuccess, setWithdrawInfoSuccess] = useState<TWithdrawInfoSuccess>(
    InitialWithdrawSuccessCheck,
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
    const item = tokenList?.find((item) => item.symbol === currentSymbol);
    return item?.symbol ? item : InitialWithdrawState.tokenList[0];
  }, [currentSymbol, tokenList]);

  const currentTokenDecimal = useMemo(() => currentToken.decimals, [currentToken.decimals]);

  const currentTokenAddress = useMemo(
    () => currentToken.contractAddress,
    [currentToken.contractAddress],
  );

  const onSubmit = useCallback(() => {
    if (!currentNetwork) return;
    setIsDoubleCheckModalOpen(true);
  }, [currentNetwork]);

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
              <span className={styles['remaining-limit-value-limit-currency']}>
                {withdrawInfo.limitCurrency}
              </span>
            </>
          ) : (
            defaultNullValue
          )}
          <RemainingQuota content={RemainingWithdrawalQuotaTooltip}></RemainingQuota>
        </span>
        <span className={styles['remaining-limit-label']}>
          {isPadPX && '• 24-Hour Limit:'}
          {!isPadPX && (
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
  }, [withdrawInfo.remainingLimit, withdrawInfo.totalLimit, withdrawInfo.limitCurrency, isPadPX]);

  const getAddressInput = useCallback(() => {
    return form.getFieldValue(FormKeys.ADDRESS)?.trim();
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
          if (error.name !== CommonErrorNameType.CANCEL && !isAuthTokenError(error)) {
            singleMessage.error(handleErrorMessage(error));
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
    async (optionSymbol?: string, newMaxBalance?: string) => {
      const symbol = optionSymbol || currentSymbol;
      try {
        setIsTransactionFeeLoading(true);
        const params: TGetWithdrawInfoRequest = {
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
          !isAuthTokenError(error)
        ) {
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

  const [{ wallet }] = useWalletContext();
  const getMaxBalance = useCallback(
    async (isLoading: boolean, item?: TTokenItem) => {
      try {
        const symbol = item?.symbol || currentSymbol;
        const decimal = item?.decimals || currentTokenDecimal;
        const caAddress = accounts?.[currentChainItemRef.current.key]?.[0];
        if (!caAddress || !wallet) return '';
        isLoading && setIsMaxBalanceLoading(true);
        const maxBalance = await getBalance({
          wallet,
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
        singleMessage.error(handleErrorMessage(error));
        throw new Error('Failed to get balance.');
      } finally {
        isLoading && setIsMaxBalanceLoading(false);
      }
    },
    [accounts, currentSymbol, currentTokenDecimal, getWithdrawData, handleAmountValidate, wallet],
  );

  const getMaxBalanceInterval = useCallback(
    async (item?: TTokenItem) => {
      if (getMaxBalanceTimerRef.current) clearInterval(getMaxBalanceTimerRef.current);
      getMaxBalanceTimerRef.current = setInterval(async () => {
        await getMaxBalance(false, item);
      }, 8000);
    },
    [getMaxBalance],
  );

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

  const handleApproveToken = useCallback(async () => {
    const newMaxBalance = await getMaxBalance(false);
    if (ZERO.plus(newMaxBalance).isLessThan(ZERO.plus(balance))) {
      const error = new Error(
        `Insufficient ${currentSymbol} balance in your account. Please consider transferring a smaller amount or topping up before you try again.`,
      );
      error.name = ErrorNameType.FAIL_MODAL_REASON;
      throw error;
    }

    const ownerAddress = accounts?.[currentChainItemRef.current.key]?.[0] || '';
    if (!wallet) return;
    const checkRes = await checkTokenAllowanceAndApprove({
      wallet,
      chainId: currentChainItemRef.current.key,
      symbol: currentSymbol,
      address: ownerAddress,
      approveTargetAddress: currentTokenAddress,
      amount: balance,
    });

    return checkRes;
  }, [accounts, balance, currentSymbol, currentTokenAddress, getMaxBalance, wallet]);

  const handleCreateWithdrawOrder = useCallback(
    async ({ address, rawTransaction }: { address: string; rawTransaction: string }) => {
      try {
        if (!currentNetworkRef.current?.network) throw new Error('Please selected network');

        const createWithdrawOrderRes = await createWithdrawOrder({
          network: currentNetworkRef.current.network,
          symbol: currentSymbol,
          amount: balance,
          fromChainId: currentChainItemRef.current.key,
          toAddress: isDIDAddressSuffix(address) ? removeELFAddressSuffix(address) : address,
          rawTransaction: rawTransaction,
        });
        console.log(
          '>>>>>> handleCreateWithdrawOrder createWithdrawOrderRes',
          createWithdrawOrderRes,
        );
        if (createWithdrawOrderRes.orderId) {
          setWithdrawInfoSuccess({
            receiveAmount: receiveAmount,
            network: currentNetworkRef.current,
            amount: balance,
            symbol: formatSymbolDisplay(currentSymbol),
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
        setLoading(false);
        setIsDoubleCheckModalOpen(false);

        await sleep(1000);
        myEvents.UpdateNewRecordStatus.emit();
      }
    },
    [balance, currentSymbol, receiveAmount, setLoading, withdrawInfo.receiveAmountUsd],
  );

  const sendTransferTokenTransaction = useDebounceCallback(async () => {
    try {
      setLoading(true, { text: 'Please approve the transaction in the wallet...' });
      const address = getAddressInput();
      if (!address) throw new Error('Please enter a correct address.');

      const approveRes = await handleApproveToken();
      if (!approveRes) throw new Error(InsufficientAllowanceMessage);
      console.log('>>>>>> sendTransferTokenTransaction approveRes', approveRes);

      if (approveRes && wallet?.getSignature) {
        const { caHash } = await getCaHashAndOriginChainIdByWallet(
          wallet.walletInfo,
          wallet.walletType,
        );
        const managerAddress = await getManagerAddressByWallet(
          wallet.walletInfo,
          wallet.walletType,
        );
        const ownerAddress = accounts?.[currentChainItemRef.current.key]?.[0] || '';
        const transaction = await createTransferTokenTransaction({
          wallet,
          caContractAddress:
            ADDRESS_MAP[currentVersion][currentChainItemRef.current.key][ContractType.CA],
          eTransferContractAddress: currentTokenAddress,
          caHash: caHash,
          symbol: currentSymbol,
          amount: timesDecimals(balance, currentTokenDecimal).toFixed(),
          chainId: currentChainItemRef.current.key,
          fromManagerAddress: wallet.walletType === WalletType.elf ? ownerAddress : managerAddress,
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

    if (handleAmountValidate()) {
      await getWithdrawData();
    }
  }, [maxBalance, form, handleAmountValidate, getWithdrawData]);

  const onAddressChange = useCallback(
    (value: string | null) => {
      dispatch(setWithdrawAddress(value || ''));
    },
    [dispatch],
  );

  const onAddressBlur = useCallback(async () => {
    const address = getAddressInput();
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
    } else if (address.length < 32 || address.length > 59) {
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

    if (isDIDAddressSuffix(address)) {
      form.setFieldValue(FormKeys.ADDRESS, removeELFAddressSuffix(address));
      dispatch(setWithdrawAddress(removeAddressSuffix(address)));
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
    getAddressInput,
    getAllNetworkData,
    getNetworkData,
    getWithdrawData,
    handleFormValidateDataChange,
  ]);

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

  const init = useCallback(async () => {
    try {
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
    setLoading,
    tokenList,
    withdraw.address,
    withdraw.currentNetwork,
    withdraw.networkList,
  ]);

  const router = useRouter();
  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.Withdraw));
    init();

    router.replace('/withdraw');

    return () => {
      if (getMaxBalanceTimerRef.current) clearInterval(getMaxBalanceTimerRef.current);
    };
  });

  useEffect(() => {
    const { remove } = myEvents.AuthTokenSuccess.addListener(() => {
      console.log('login success');
      init();
    });
    return () => {
      remove();
    };
  }, [init]);

  const renderMainContent = useMemo(() => {
    return (
      <div
        className={clsx(
          'main-content-container',
          'main-content-container-safe-area',
          !isPadPX && styles['main-content'],
        )}>
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
                label="Withdrawal Assets"
                name={FormKeys.TOKEN}
                validateStatus={formValidateData[FormKeys.TOKEN].validateStatus}
                help={formValidateData[FormKeys.TOKEN].errorMessage}>
                <SelectToken
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
            <div className={clsx(styles['form-item-wrapper'], styles['amount-form-item-wrapper'])}>
              <Form.Item
                className={styles['form-item']}
                label={
                  <div className={clsx('flex-row-between', styles['form-label-wrapper'])}>
                    <span className={styles['form-label']}>Withdrawal Amount</span>
                    {!isPadPX && remainingLimitComponent}
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
                {!maxBalance || isMaxBalanceLoading ? (
                  <PartialLoading />
                ) : (
                  `${maxBalance} ${formatSymbolDisplay(currentSymbol)}`
                )}
              </div>
            </div>
            {isPadPX && remainingLimitComponent}
            {isPadPX && currentNetwork?.contractAddress && (
              <ContractAddressForMobile
                label={CONTRACT_ADDRESS}
                networkName={currentNetwork.name}
                address={currentNetwork.contractAddress}
                explorerUrl={currentNetwork?.explorerUrl}
              />
            )}
            <div className={clsx(styles['form-footer'], styles['form-footer-safe-area'])}>
              <div className={clsx('flex-1', 'flex-column', styles['footer-info-wrapper'])}>
                <div className={clsx('flex-column', styles['receive-amount-wrapper'])}>
                  <div className={styles['info-label']}>Amount to Be Received</div>
                  <div
                    className={clsx(
                      'flex-row-center',
                      styles['info-value'],
                      styles['info-value-big-font'],
                    )}>
                    {isTransactionFeeLoading && <PartialLoading />}
                    {!isTransactionFeeLoading &&
                      `${(!isSuccessModalOpen && receiveAmount) || defaultNullValue} `}
                    <span className={clsx(styles['info-unit'])}>
                      {withdrawInfo.transactionUnit}
                    </span>
                  </div>
                </div>
                <FeeInfo
                  isTransactionFeeLoading={isTransactionFeeLoading}
                  isSuccessModalOpen={isSuccessModalOpen}
                  transactionFee={withdrawInfo.transactionFee}
                  transactionUnit={withdrawInfo.transactionUnit}
                  aelfTransactionFee={withdrawInfo.aelfTransactionFee}
                  aelfTransactionUnit={withdrawInfo.aelfTransactionUnit}
                />
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
      </div>
    );
  }, [
    currentNetwork,
    currentSymbol,
    currentToken,
    currentTokenDecimal,
    form,
    formValidateData,
    getWithdrawData,
    handleAmountValidate,
    handleChainChanged,
    handleNetworkChanged,
    handleTokenChange,
    isAndroid,
    isMaxBalanceLoading,
    isPadPX,
    isNetworkDisable,
    isShowNetworkLoading,
    isSubmitDisabled,
    isSuccessModalOpen,
    isTransactionFeeLoading,
    maxBalance,
    minAmount,
    networkList,
    onAddressBlur,
    onAddressChange,
    onSubmit,
    receiveAmount,
    remainingLimitComponent,
    setMaxToken,
    tokenList,
    withdrawInfo.aelfTransactionFee,
    withdrawInfo.aelfTransactionUnit,
    withdrawInfo.transactionFee,
    withdrawInfo.transactionUnit,
  ]);

  return (
    <>
      <div className={clsx('content-container', !isPadPX && 'flex-row')}>
        <div className={clsx(!isPadPX && styles['main-wrapper'])}>{renderMainContent}</div>
        {!isPadPX && (
          <div className={clsx('flex-row', styles['faq-wrapper'])}>
            <div className={styles['faq-left']}></div>
            <FAQ className={styles['faq']} title={FAQ_WITHDRAW.title} list={FAQ_WITHDRAW.list} />
          </div>
        )}
      </div>

      <DoubleCheckModal
        withdrawInfo={{
          receiveAmount,
          address: getAddressInput(),
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
          footerSlot: CommonLink({
            href: getAelfExploreLink(
              withdrawInfoSuccess.transactionId,
              AelfExploreType.transaction,
              currentChainItemRef.current.key,
            ),
            isTagA: true,
            children: (
              <div className={clsx(styles['link-wrap'], !isPadPX && styles['linkToExplore'])}>
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
