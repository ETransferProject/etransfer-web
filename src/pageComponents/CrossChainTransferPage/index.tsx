import { useEffectOnce } from 'react-use';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import { useAppDispatch, useCommonState, useCrossChainTransfer } from 'store/Provider/hooks';
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
import { InitialCrossChainTransferInfo } from 'constants/transfer';
import { useWallet } from 'context/Wallet';
import {
  TRANSFER_FORM_VALIDATE_DATA,
  TransferFormKeys,
  TransferValidateStatus,
  TTransferFormValues,
} from './types';
import { isDIDAddressSuffix } from 'utils/aelf/aelfBase';
import { WalletTypeEnum } from 'context/Wallet/types';
import { computeToNetworkList } from './utils';

export default function CrossChainTransferPage() {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();
  const [{ fromWallet, toWallet }] = useWallet();
  const { fromNetwork, toNetwork, tokenSymbol } = useCrossChainTransfer();
  const fromNetworkRef = useRef<TNetworkItem>();
  const totalTokenListRef = useRef<TTokenItem[]>([]);
  const [form] = Form.useForm<TTransferFormValues>();
  const [formValidateData, setFormValidateData] = useState<{
    [key in TransferFormKeys]: { validateStatus: TransferValidateStatus; errorMessage: string };
  }>(JSON.parse(JSON.stringify(TRANSFER_FORM_VALIDATE_DATA)));
  const [transferInfo, setTransferInfo] = useState<TCrossChainTransferInfo>(
    InitialCrossChainTransferInfo,
  );
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [amount, setAmount] = useState('');

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

  const getTokenData = useCallback(
    async (isInitCurrentSymbol?: boolean) => {
      try {
        const res = await getTokenList({
          type: BusinessType.Transfer,
        });

        dispatch(setTotalTokenList(res.tokenList));
        totalTokenListRef.current = res.tokenList;

        dispatch(setTokenList(res.tokenList)); // TODO

        if (isInitCurrentSymbol && !tokenSymbol) {
          dispatch(setTokenSymbol(res.tokenList[0].symbol));
        } else {
          const exitToken = res.tokenList.find((item) => item.symbol === tokenSymbol);
          if (exitToken) {
            dispatch(setTokenSymbol(exitToken.symbol));
          } else {
            dispatch(setTokenSymbol(''));
          }
        }
        return res.tokenList;
      } catch (error) {
        console.log('getTokenData error', error);
        return [];
      }
    },
    [dispatch, tokenSymbol],
  );

  const getNetworkData = useCallback(async () => {
    try {
      const { networkList } = await getNetworkList({ type: BusinessType.Transfer });

      dispatch(setTotalNetworkList(networkList));
      dispatch(setFromNetworkList(networkList));

      const toNetworkList = computeToNetworkList(
        fromNetwork,
        networkList,
        totalTokenListRef.current,
      );
      dispatch(setToNetworkList(toNetworkList)); // TODO

      if (networkList?.length > 0) {
        // from logic
        const exitFromNetwork = networkList.find((item) => item.network === fromNetwork?.network);
        if (exitFromNetwork && exitFromNetwork.status !== NetworkStatus.Offline) {
          dispatch(setFromNetwork(exitFromNetwork));
        } else {
          dispatch(setFromNetwork(networkList[0]));
        }

        // to logic
        const exitToNetwork = networkList.find((item) => item.network === toNetwork?.network);
        if (exitToNetwork && exitToNetwork.status !== NetworkStatus.Offline) {
          dispatch(setToNetwork(exitToNetwork));
        } else {
          dispatch(setToNetwork(networkList[0]));
        }
      } else {
        // TODO
        // dispatch(setFromNetwork(undefined));
        // dispatch(setToNetwork(undefined));
      }
    } catch (error: any) {
      console.log('getNetworkData error', error);
    }
  }, [dispatch, fromNetwork, toNetwork?.network]);

  const getTransferData = useCallback(
    async (symbol?: string, amount?: string) => {
      try {
        if (!fromNetworkRef.current?.network) return;

        const params: TGetTransferInfoRequest = {
          fromNetwork: fromNetworkRef.current.network,
          symbol: symbol || tokenSymbol,
        };
        if (amount) params.amount = amount;
        const comment = getCommentInput();
        if (toWallet?.walletType === WalletTypeEnum.TON && comment) params.memo = comment;

        const res = await getTransferInfo(params);
        setTransferInfo({
          ...res.transferInfo,
          limitCurrency: formatSymbolDisplay(res.transferInfo.limitCurrency),
          transactionUnit: formatSymbolDisplay(res.transferInfo?.transactionUnit || ''),
        });
        console.log('getTransferData res', res);
      } catch (error) {
        console.log('getTransferData error', error);
      }
    },
    [getCommentInput, toWallet?.walletType, tokenSymbol],
  );

  const handleAmountChange = useCallback((value: string) => {
    setAmount(value);
  }, []);

  const handleRecipientAddressChange = useCallback(
    (value: string | null) => {
      dispatch(setRecipientAddress(value || ''));
    },
    [dispatch],
  );

  const handleRecipientAddressBlur = useCallback(async () => {
    const addressInput = getRecipientAddressInput();

    if (!addressInput) {
      handleFormValidateDataChange({
        [TransferFormKeys.RECIPIENT]: {
          validateStatus: TransferValidateStatus.Normal,
          errorMessage: '',
        },
      });
      await getNetworkData();
      await getTransferData();
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

    await getNetworkData();
    await getTransferData();
  }, [
    form,
    getNetworkData,
    getRecipientAddressInput,
    getTransferData,
    handleFormValidateDataChange,
  ]);

  const router = useRouter();
  const handleClickProcessingTip = useCallback(() => {
    router.push('/history');
  }, [router]);

  const init = useCallback(async () => {
    await getNetworkData();
    await getTokenData();
  }, [getNetworkData, getTokenData]);

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.CrossChainTransfer));
  });

  useEffect(() => {
    init();
  }, [init]);

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
      isSubmitDisabled={isSubmitDisabled}
      getTransferData={getTransferData}
      onAmountChange={handleAmountChange}
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
      isSubmitDisabled={isSubmitDisabled}
      getTransferData={getTransferData}
      onAmountChange={handleAmountChange}
      onRecipientAddressChange={handleRecipientAddressChange}
      onRecipientAddressBlur={handleRecipientAddressBlur}
      onClickProcessingTip={handleClickProcessingTip}
    />
  );
}
