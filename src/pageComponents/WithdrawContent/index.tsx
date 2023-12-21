/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Form } from 'antd';
import clsx from 'clsx';
import SelectChainWrapper from 'pageComponents/SelectChainWrapper';
import CommonButton from 'components/CommonButton';
import FormTextarea from 'components/FormTextarea';
import FormInputNumber from 'components/FormInputNumber';
import SelectNetwork from 'pageComponents/SelectNetwork';
import DoubleCheckModal, { DoubleCheckModalProps } from './DoubleCheckModal';
import SuccessModal from './SuccessModal';
import FailModal from './FailModal';
import {
  NetworkItem,
  WithdrawInfo,
  GetNetworkListRequest,
  BusinessType,
  GetWithdrawInfoRequest,
} from 'types/api';
import { formatWithThousandsSeparator, parserWithThousandsSeparator } from 'utils/common';
import {
  useAppDispatch,
  useCommonState,
  useLoading,
  usePortkeyWalletState,
  useTokenState,
  useUserActionState,
} from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { ADDRESS_MAP, ChainNameItem, USDT_DECIMAL } from 'constants/index';
import { createWithdrawOrder, getNetworkList, getWithdrawInfo } from 'utils/api/deposit';
import {
  CONTRACT_ADDRESS,
  initialWithdrawInfo,
  initialWithdrawInfoCheck,
  initialWithdrawSuccessCheck,
} from 'constants/deposit';
import { WithdrawInfoSuccess } from 'types/deposit';
import { checkTokenAllowanceAndApprove, createTransferTokenTransaction } from 'utils/aelfUtils';
import portkeyWallet from 'wallet/portkeyWallet';
import singleMessage from 'components/SingleMessage';
import { handleErrorMessage } from 'aelf-web-login';
import { divDecimals, timesDecimals } from 'utils/calculate';
import { ContractMethodName } from 'constants/contract';
import { ZERO } from 'constants/misc';
import contractUnity from 'contract/portkey';
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
import { WITHDRAW_AMOUNT_NOT_ENOUGH_ERROR_MESSAGE_BEGINNING } from 'constants/withdraw';

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

const NETWORK_DATA_ERROR_LIST = ['address', 'is currently not supported'];

export default function WithdrawContent() {
  const dispatch = useAppDispatch();
  const { isMobilePX, currentChainItem } = useCommonState();
  const currentChainItemRef = useRef<ChainNameItem>(currentChainItem);
  const { accounts } = usePortkeyWalletState();
  const { currentSymbol, tokenList } = useTokenState();
  const { withdraw } = useUserActionState();
  const { setLoading } = useLoading();
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
  const [withdrawInfoCheck, setWithdrawInfoCheck] =
    useState<DoubleCheckModalProps['withdrawInfo']>(initialWithdrawInfoCheck);
  const [withdrawInfoSuccess, setWithdrawInfoSuccessCheck] = useState<WithdrawInfoSuccess>(
    initialWithdrawSuccessCheck,
  );
  const [formValidateData, setFormValidateData] = useState<{
    [key in FormKeys]: { validateStatus: ValidateStatus; errorMessage: string };
  }>({
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
    if (
      !balance ||
      !withdrawInfo.transactionFee ||
      ZERO.plus(balance).isLessThan(ZERO.plus(withdrawInfo.transactionFee)) ||
      ZERO.plus(balance).isLessThan(ZERO.plus(minAmount))
    ) {
      return '-';
    } else {
      const res = BigNumber(balance).minus(BigNumber(withdrawInfo.transactionFee)).toFixed();
      return res;
    }
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
    setWithdrawInfoCheck({
      receiveAmount: receiveAmount,
      address: form.getFieldValue(FormKeys.ADDRESS) || '',
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
    });
    getWithdrawData();
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
          {withdrawInfo.remainingLimit} {withdrawInfo.limitCurrency} / {withdrawInfo.totalLimit}{' '}
          {withdrawInfo.limitCurrency}
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
        isValueUndefined(form.getFieldValue(FormKeys.NETWORK)) ||
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

  const handleAddressWarningValidate = useCallback(() => {
    const address = form.getFieldValue(FormKeys.ADDRESS);
    if (address.length >= 32 && address.length <= 39) {
      handleFormValidateDataChange({
        [FormKeys.ADDRESS]: {
          validateStatus: ValidateStatus.Warning,
          errorMessage:
            'The address you entered is shorter than usual, please carefully verify its accuracy.',
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
  }, [form, handleFormValidateDataChange]);

  const getNetworkData = useCallback(
    async ({ symbol, address }: Omit<GetNetworkListRequest, 'type' | 'chainId'>) => {
      try {
        setLoading(true);
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
        handleAddressWarningValidate();
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const errorString = (error as Error).message;
        if (NETWORK_DATA_ERROR_LIST.some((item) => errorString.includes(item))) {
          handleFormValidateDataChange({
            [FormKeys.ADDRESS]: {
              validateStatus: ValidateStatus.Error,
              errorMessage: errorString,
            },
          });
        } else {
          handleAddressWarningValidate();
          singleMessage.error(handleErrorMessage(error));
        }
        setNetworkList([]);
        dispatch(setWithdrawNetworkList([]));
        setCurrentNetwork(undefined);
        currentNetworkRef.current = undefined;
        dispatch(setWithdrawCurrentNetwork(undefined));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, handleAddressWarningValidate, handleFormValidateDataChange, setLoading],
  );

  const getWithdrawData = useCallback(async () => {
    try {
      setIsTransactionFeeLoading(true);
      const params: GetWithdrawInfoRequest = {
        chainId: currentChainItemRef.current.key,
        symbol: currentSymbol,
      };
      if (currentNetworkRef.current?.network) {
        params.network = currentNetworkRef.current?.network;
      }
      const res = await getWithdrawInfo(params);

      setWithdrawInfo(res.withdrawInfo);
    } catch (error) {
      singleMessage.error(handleErrorMessage(error));
    } finally {
      setIsTransactionFeeLoading(false);
    }
  }, [currentSymbol]);

  useEffect(() => {
    if (
      (currentNetwork?.network === 'SETH' || currentNetwork?.network === 'ETH') &&
      Number(withdrawInfo.transactionFee) > 60
    ) {
      handleFormValidateDataChange({
        [FormKeys.NETWORK]: {
          validateStatus: ValidateStatus.Warning,
          errorMessage:
            'The current Ethereum network gas price is high, it is recommended to withdraw later.',
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
      const tokenContract = await contractUnity.getContract({
        chainId: currentChainItemRef.current.key,
        contractType: ContractType.TOKEN,
      });

      const caAddress = accounts?.[currentChainItemRef.current.key]?.[0];

      const {
        data: { balance: maxBalance },
      } = await tokenContract.callViewMethod(ContractMethodName.GetBalance, {
        symbol: currentSymbol,
        owner: caAddress, // caAddress
      });
      setMaxBalance(divDecimals(maxBalance, currentTokenDecimal).toFixed());
      return maxBalance;
    } catch (error) {
      singleMessage.error(handleErrorMessage(error));
    }
  }, [accounts, currentSymbol, currentTokenDecimal]);

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
    const parserNumber = Number(parserWithThousandsSeparator(amount));
    if (parserNumber <= Number(parserWithThousandsSeparator(minAmount))) {
      handleFormValidateDataChange({
        [FormKeys.AMOUNT]: {
          validateStatus: ValidateStatus.Error,
          errorMessage: `The minimum amount is ${minAmount} ${withdrawInfo.transactionUnit}. Please enter a value no less than this.`,
        },
      });
    } else if (
      withdrawInfo?.remainingLimit &&
      parserNumber > Number(parserWithThousandsSeparator(withdrawInfo.remainingLimit))
    ) {
      handleFormValidateDataChange({
        [FormKeys.AMOUNT]: {
          validateStatus: ValidateStatus.Error,
          errorMessage:
            'The amount exceeds the remaining withdrawal quota. Please consider transferring a smaller amount.',
        },
      });
    } else if (parserNumber > Number(parserWithThousandsSeparator(maxBalance))) {
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
    async (item: ChainNameItem) => {
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
      if (new Date().getTime() + 10000 > withdrawInfo.expiredTimestamp) {
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
    const tokenContract = await contractUnity.getContract({
      chainId: currentChainItemRef.current.key,
      contractType: ContractType.TOKEN,
    });

    const newMaxBalance = await getMaxBalance();
    console.log('🌈 🌈 🌈 🌈 🌈 🌈 newMaxBalance ', newMaxBalance);
    if (ZERO.plus(newMaxBalance).isLessThan(ZERO.plus(balance))) {
      throw new Error(
        `Insufficient ${currentSymbol} balance in your account. Please consider transferring a smaller amount or topping up before you try again.`,
      );
    }

    const ownerAddress = accounts?.[currentChainItemRef.current.key]?.[0] || '';
    const approveTargetAddress =
      ADDRESS_MAP[currentChainItemRef.current.key][ContractType.ETRANSFER];

    const checkRes = await checkTokenAllowanceAndApprove({
      tokenContract,
      symbol: currentSymbol,
      address: ownerAddress,
      approveTargetAddress,
      amount: balance,
    });

    return checkRes;
  }, [accounts, balance, currentSymbol, getMaxBalance]);

  const sendTransferTokenTransaction = useDebounceCallback(async () => {
    console.log('🌈 🌈 🌈 🌈 🌈 🌈 sendTransferTokenTransaction', sendTransferTokenTransaction);
    try {
      setLoading(true, { text: 'Please approve the transaction in the wallet...' });
      const address = form.getFieldValue(FormKeys.ADDRESS);
      if (!address) throw new Error('Please enter a correct address.');

      const approveRes = await handleApproveToken();
      if (!approveRes)
        throw new Error(
          'Insufficient allowance. Please try again, ensuring that you approve an adequate amount as the allowance.',
        );
      console.log('🌈 🌈 🌈 🌈 🌈 🌈 approveRes', approveRes);

      if (approveRes) {
        if (!portkeyWallet?.manager?.caAddress) throw new Error('no caContractAddress');
        if (!portkeyWallet?.caHash) throw new Error('no caHash');

        const transaction = await createTransferTokenTransaction({
          caContractAddress: ADDRESS_MAP[currentChainItemRef.current.key][ContractType.CA],
          eTransferContractAddress:
            ADDRESS_MAP[currentChainItemRef.current.key][ContractType.ETRANSFER],
          caHash: portkeyWallet.caHash,
          symbol: currentSymbol,
          amount: timesDecimals(balance, currentTokenDecimal).toFixed(),
          chainId: currentChainItemRef.current.key,
        });
        console.log(transaction, '=====transaction');

        if (!currentNetworkRef.current?.network) throw new Error('please selected network');

        const createWithdrawOrderRes = await createWithdrawOrder({
          network: currentNetworkRef.current.network,
          symbol: currentSymbol,
          amount: balance,
          fromChainId: currentChainItemRef.current.key,
          toAddress: address,
          rawTransaction: transaction,
          feeInfo: {
            thirdPart: {
              amount: withdrawInfo.transactionFee,
              unit: withdrawInfo.transactionUnit,
            },
            aelf: {
              amount: withdrawInfo.aelfTransactionFee,
              unit: withdrawInfo.aelfTransactionUnit,
            },
          },
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
          setFailModalReason(
            'The transaction failed due to an unexpected error. Please try again later.',
          );
          setIsFailModalOpen(true);
        }
      } else {
        throw new Error('Approve Failed');
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error?.code == 4001) {
        setFailModalReason('The request is rejected. ETransfer needs your permission to proceed.');
      } else if (error?.message?.startsWith(WITHDRAW_AMOUNT_NOT_ENOUGH_ERROR_MESSAGE_BEGINNING)) {
        const reason = error.message.split(WITHDRAW_AMOUNT_NOT_ENOUGH_ERROR_MESSAGE_BEGINNING)[1];
        setFailModalReason(reason);
      } else {
        setFailModalReason(
          'The transaction failed due to an unexpected error. Please try again later.',
        );
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
      if (!Array.isArray(networkList) || networkList.length === 0) {
        await getNetworkData({
          symbol: currentSymbol,
          address: address,
        });
        await getWithdrawData();
        handleAmountValidate();
      }
      return;
    } else if (address.length < 32 || address.length > 44) {
      handleFormValidateDataChange({
        [FormKeys.ADDRESS]: {
          validateStatus: ValidateStatus.Error,
          errorMessage: 'Please enter a correct address.',
        },
      });
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
    getNetworkData,
    getWithdrawData,
    handleAmountValidate,
    handleFormValidateDataChange,
    networkList,
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
      return '-';
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
        chainChanged={(item: ChainNameItem) => handleChainChanged(item)}
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
                selectCallback={handleNetworkChanged}
              />
            </Form.Item>
            {!!currentNetwork?.contractAddress && (
              <div className={clsx('flex-row-start', styles['info-wrapper-contract-address'])}>
                <div className={clsx('flex-none', styles['info-label'])}>{CONTRACT_ADDRESS}</div>
                <div className={clsx('flex-1', 'flex-row-content-end')}>
                  <span
                    className={clsx('text-right', 'text-break', styles['info-value'], {
                      'text-link': !!currentNetwork?.explorerUrl,
                    })}
                    onClick={() => {
                      if (currentNetwork?.explorerUrl) {
                        window?.open(currentNetwork.explorerUrl, '_blank');
                      }
                    }}>
                    {currentNetwork?.contractAddress}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className={styles['form-item-wrapper']}>
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
              <FormInputNumber
                unit={withdrawInfo.transactionUnit}
                maxButtonConfig={{
                  onClick: () => setMaxToken(),
                }}
                inputNumberProps={{
                  placeholder: `Minimum: ${minAmount}`,
                  stringMode: true,
                  min: '0',
                  precision: 6,
                  formatter: (value, info) =>
                    formatWithThousandsSeparator(value, {
                      inputValue: info?.input,
                      isTyping: info?.userTyping,
                    }),
                  parser: parserWithThousandsSeparator,
                }}
                onChange={(value) => {
                  setBalance(value || '');
                  form.setFieldValue(FormKeys.AMOUNT, value || '');
                }}
                onBlur={handleAmountValidate}
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
          <div className={clsx(styles['form-footer'], styles['form-footer-safe-area'])}>
            <div className={clsx('flex-1', 'flex-column', styles['transaction-info-wrapper'])}>
              <div className={clsx('flex-row-center', styles['info-wrapper'])}>
                <div className={styles['info-label']}>Transaction Fee: </div>
                <div className={clsx('flex-row-center', styles['info-value'])}>
                  {renderTransactionFeeValue()}
                </div>
              </div>
              <div className={'flex-column'}>
                <div className={styles['info-label']}>Amount to Be Received</div>
                <div className={clsx(styles['info-value'], styles['info-value-big-font'])}>
                  {receiveAmount || '-'} {withdrawInfo.transactionUnit}
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
                disabled={isTransactionFeeLoading || isSubmitDisabled}>
                Withdraw
              </CommonButton>
            </Form.Item>
          </div>
        </Form>
      </div>
      <DoubleCheckModal
        withdrawInfo={withdrawInfoCheck}
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
          onClose: () => setIsFailModalOpen(false),
          onOk: () => setIsFailModalOpen(false),
        }}
      />
    </>
  );
}
