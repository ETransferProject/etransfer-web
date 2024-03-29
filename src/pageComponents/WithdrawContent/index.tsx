/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Form } from 'antd';
import clsx from 'clsx';
import SelectChainWrapper from 'pageComponents/SelectChainWrapper';
import CommonButton from 'components/CommonButton';
import FormTextarea from 'components/FormTextarea';
import SelectNetwork from 'pageComponents/SelectNetwork';
import DoubleCheckModal from './DoubleCheckModal';
import SuccessModal from './SuccessModal';
import FailModal from './FailModal';
import {
  NetworkItem,
  WithdrawInfo,
  GetNetworkListRequest,
  BusinessType,
  GetWithdrawInfoRequest,
} from 'types/api';
import {
  useAppDispatch,
  useCommonState,
  useLoading,
  useTokenState,
  useUserActionState,
} from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { ADDRESS_MAP, IChainNameItem, USDT_DECIMAL } from 'constants/index';
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
} from 'constants/withdraw';
import { CommonErrorNameType } from 'api/types';
import { ContractAddressForMobile, ContractAddressForWeb } from './ContractAddress';
import { handleErrorMessage } from '@portkey/did-ui-react';
import { useAccounts } from 'hooks/portkeyWallet';
import getPortkeyWallet from 'wallet/portkeyWallet';
import FormInput from 'pageComponents/WithdrawContent/FormAmountInput';
import { formatWithCommas, parseWithCommas, parseWithStringCommas } from 'utils/format';
import { sleep } from 'utils/common';
import { devices } from '@portkey/utils';
import { ConnectWalletError } from 'constants/wallet';

enum ValidateStatus {
  Error = 'error',
  Warning = 'warning',
  Normal = '',
}

enum FormKeys {
  ADDRESS = 'address',
  NETWORK = 'network',
  AMOUNT = 'amount',
}

type FormValuesType = {
  [FormKeys.ADDRESS]: string;
  [FormKeys.NETWORK]: NetworkItem;
  [FormKeys.AMOUNT]: string;
};

const CheckNumberReg = /^[0-9]{1,9}((\.\d)|(\.\d{1,6}))?$/;

export default function WithdrawContent() {
  const dispatch = useAppDispatch();
  const isAndroid = devices.isMobile().android;
  const { isMobilePX, currentChainItem, currentVersion } = useCommonState();
  const currentChainItemRef = useRef<IChainNameItem>(currentChainItem);
  const accounts = useAccounts();
  const { currentSymbol, tokenList } = useTokenState();
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
    [FormKeys.ADDRESS]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
    [FormKeys.NETWORK]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
    [FormKeys.AMOUNT]: { validateStatus: ValidateStatus.Normal, errorMessage: '' },
  });
  const [isTransactionFeeLoading, setIsTransactionFeeLoading] = useState(false);

  const getTransactionFeeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const preReceiveAmountRef = useRef('');

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
    preReceiveAmountRef.current = result;
    return result;
  }, [balance, minAmount, withdrawInfo.transactionFee]);

  const getMaxBalanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTokenDecimal = useMemo(() => {
    const res = tokenList.filter((item) => item.symbol === currentSymbol);
    if (res.length > 0 && res[0]?.decimals) {
      return res[0].decimals;
    }
    return USDT_DECIMAL;
  }, [currentSymbol, tokenList]);

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
        <span className={styles['remaining-limit-label']}>
          {isMobilePX && '• '}Remaining Withdrawal Quota{isMobilePX && ':'}
        </span>
        <span className={styles['remaining-limit-value']}>
          {withdrawInfo.remainingLimit && withdrawInfo.totalLimit
            ? `${withdrawInfo.remainingLimit} ${withdrawInfo.limitCurrency} / ${withdrawInfo.totalLimit} 
          ${withdrawInfo.limitCurrency}`
            : '--'}
        </span>
      </div>
    );
  }, [
    withdrawInfo.limitCurrency,
    withdrawInfo.remainingLimit,
    withdrawInfo.totalLimit,
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

        if (networkList?.length === 1) {
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

  const getWithdrawData = useCallback(async () => {
    try {
      setIsTransactionFeeLoading(true);
      const params: GetWithdrawInfoRequest = {
        chainId: currentChainItemRef.current.key,
        symbol: currentSymbol,
        version: currentVersion,
      };
      if (currentNetworkRef.current?.network) {
        params.network = currentNetworkRef.current?.network;
      }
      const res = await getWithdrawInfo(params);

      setWithdrawInfo(res.withdrawInfo);
      setIsTransactionFeeLoading(false);
    } catch (error: any) {
      setWithdrawInfo(initialWithdrawInfo);
      if (error.name !== CommonErrorNameType.CANCEL) {
        singleMessage.error(handleErrorMessage(error));
        setIsTransactionFeeLoading(false);
      }
    }
  }, [currentSymbol, currentVersion]);

  useEffect(() => {
    if (
      (currentNetwork?.network === 'SETH' || currentNetwork?.network === 'ETH') &&
      Number(withdrawInfo.transactionFee) > 60
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
  }, [currentNetwork?.network, handleFormValidateDataChange, withdrawInfo.transactionFee]);

  const getMaxBalance = useCallback(async () => {
    try {
      console.log('🌈 currentVersion', currentVersion);
      const caAddress = accounts?.[currentChainItemRef.current.key]?.[0];
      if (!caAddress || !currentVersion) return '';
      const maxBalance = await getBalance({
        symbol: currentSymbol,
        chainId: currentChainItemRef.current.key,
        caAddress,
        version: currentVersion,
      });
      const tempMaxBalance = divDecimals(maxBalance, currentTokenDecimal).toFixed();
      setMaxBalance(tempMaxBalance);
      return tempMaxBalance;
    } catch (error) {
      singleMessage.error(handleErrorMessage(error));
      throw new Error('Failed to get balance.');
    }
  }, [accounts, currentSymbol, currentTokenDecimal, currentVersion]);

  const getMaxBalanceInterval = useCallback(async () => {
    if (getMaxBalanceTimerRef.current) clearInterval(getMaxBalanceTimerRef.current);
    getMaxBalanceTimerRef.current = setInterval(async () => {
      await getMaxBalance();
    }, 8000);
  }, [getMaxBalance]);

  const handleAmountValidate = useCallback(() => {
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
    if (parserNumber < Number(parseWithCommas(minAmount))) {
      handleFormValidateDataChange({
        [FormKeys.AMOUNT]: {
          validateStatus: ValidateStatus.Error,
          errorMessage: `The minimum amount is ${minAmount} ${withdrawInfo.transactionUnit}. Please enter a value no less than this.`,
        },
      });
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
    } else if (parserNumber > Number(parseWithCommas(maxBalance))) {
      handleFormValidateDataChange({
        [FormKeys.AMOUNT]: {
          validateStatus: ValidateStatus.Error,
          errorMessage:
            'Insufficient balance. Please consider transferring a smaller amount or topping up before you try again.',
        },
      });
    } else {
      handleFormValidateDataChange({
        [FormKeys.AMOUNT]: {
          validateStatus: ValidateStatus.Normal,
          errorMessage: '',
        },
      });
    }
  }, [
    form,
    handleFormValidateDataChange,
    maxBalance,
    minAmount,
    withdrawInfo.remainingLimit,
    withdrawInfo.transactionUnit,
  ]);

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

        setLoading(false);
      } catch (error) {
        setLoading(false);
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
    if (!withdrawInfo.expiredTimestamp) {
      return;
    }
    if (getTransactionFeeTimerRef.current) {
      clearInterval(getTransactionFeeTimerRef.current);
    }
    getTransactionFeeTimerRef.current = setInterval(async () => {
      if (new Date().getTime() > withdrawInfo.expiredTimestamp) {
        await getWithdrawData();
        handleAmountValidate();
      }
    }, 10000);
    return () => {
      if (getTransactionFeeTimerRef.current) {
        clearInterval(getTransactionFeeTimerRef.current);
      }
    };
  }, [getWithdrawData, handleAmountValidate, withdrawInfo.expiredTimestamp]);

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
    const approveTargetAddress =
      ADDRESS_MAP[currentVersion][currentChainItemRef.current.key][ContractType.ETRANSFER];

    const checkRes = await checkTokenAllowanceAndApprove({
      tokenContract,
      symbol: currentSymbol,
      address: ownerAddress,
      approveTargetAddress,
      amount: balance,
    });

    return checkRes;
  }, [accounts, balance, currentSymbol, currentVersion, getMaxBalance]);

  const handleCreateWithdrawOrder = useCallback(
    async ({ address, rawTransaction }: { address: string; rawTransaction: string }) => {
      try {
        if (!currentNetworkRef.current?.network) throw new Error('please selected network');

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
      }
    },
    [balance, currentSymbol, receiveAmount, setLoading],
  );

  const sendTransferTokenTransaction = useDebounceCallback(async () => {
    console.log('🌈 🌈 🌈 🌈 🌈 🌈 sendTransferTokenTransaction');
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
          eTransferContractAddress:
            ADDRESS_MAP[currentVersion][currentChainItemRef.current.key][ContractType.ETRANSFER],
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
      setLoading(false);
      setIsDoubleCheckModalOpen(false);
    }
  }, [balance, currentSymbol, handleApproveToken, receiveAmount, setLoading]);

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
      handleAmountValidate();
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
    handleAmountValidate();
  }, [
    currentSymbol,
    dispatch,
    form,
    getAllNetworkData,
    getNetworkData,
    getWithdrawData,
    handleAmountValidate,
    handleFormValidateDataChange,
  ]);

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
    handleAmountValidate();

    getWithdrawData();
  }, [form, getWithdrawData, handleAmountValidate]);

  const clickFailedOk = useCallback(() => {
    setIsFailModalOpen(false);
    setBalance('');
    form.setFieldValue(FormKeys.AMOUNT, '');
    handleAmountValidate();

    getWithdrawData();
  }, [form, getWithdrawData, handleAmountValidate]);

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
            {!isTransactionFeeLoading && `${withdrawInfo.transactionFee} `}
            {withdrawInfo.transactionUnit} + {withdrawInfo.aelfTransactionFee}{' '}
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
        webLabel="Withdraw USDT from"
        chainChanged={(item: IChainNameItem) => handleChainChanged(item)}
      />
      <div>
        <Form className={styles['form-wrapper']} layout="vertical" requiredMark={false} form={form}>
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
                max={999999999.999999}
                onInput={(event: any) => {
                  const value = event.target?.value.trim();
                  if (!value) return (event.target.value = '');

                  const lastNumber = value.charAt(value.length - 1);
                  const valueNotComma = parseWithStringCommas(value);
                  const commaCount = value.match(/\./gim)?.length;

                  if (commaCount > 1) {
                    return (event.target.value = form.getFieldValue(FormKeys.AMOUNT));
                  }

                  if (!CheckNumberReg.exec(valueNotComma)) {
                    if (lastNumber !== '.') {
                      event.target.value = form.getFieldValue(FormKeys.AMOUNT);
                      return;
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
                  handleAmountValidate();
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
            <div className={styles['info-label']}>{withdrawInfo.transactionUnit} Balance</div>
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
                  <span>
                    {!isTransactionFeeLoading && `${receiveAmount || '--'} `}
                    {withdrawInfo.transactionUnit}
                  </span>
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
