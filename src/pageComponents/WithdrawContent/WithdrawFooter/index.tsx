import React, { useState, useMemo, useCallback } from 'react';
import { Form } from 'antd';
import clsx from 'clsx';
import CommonButton from 'components/CommonButton';
import DoubleCheckModal from '../DoubleCheckModal';
import SuccessModal from '../SuccessModal';
import FailModal from '../FailModal';
import { TNetworkItem, TWithdrawInfo, BusinessType } from 'types/api';
import { useCommonState, useLoading } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { ADDRESS_MAP, defaultNullValue } from 'constants/index';
import { createWithdrawOrder } from 'utils/api/deposit';
import { TWithdrawInfoSuccess } from 'types/deposit';
import { checkTokenAllowanceAndApprove, createTransferTokenTransaction } from 'utils/contract';
import { timesDecimals } from 'utils/calculate';
import { ZERO } from 'constants/calculate';
import { ContractType } from 'constants/chain';
import { InitialWithdrawState } from 'store/reducers/withdraw/slice';
import { useDebounceCallback } from 'hooks/debounce';
import PartialLoading from 'components/PartialLoading';
import {
  DefaultWithdrawErrorMessage,
  ErrorNameType,
  InitialWithdrawSuccessCheck,
  InsufficientAllowanceMessage,
  WithdrawSendTxErrorCodeList,
} from 'constants/withdraw';
import { useGetAccount, useIsLogin, useLogin, useShowLoginButtonLoading } from 'hooks/wallet';
import { formatSymbolDisplay } from 'utils/format';
import { sleep } from '@portkey/utils';
import { useWithdraw } from 'hooks/withdraw';
import { Fingerprint } from 'assets/images';
import myEvents from 'utils/myEvent';
import { isDIDAddressSuffix, removeELFAddressSuffix } from 'utils/aelf/aelfBase';
import FeeInfo from '../FeeInfo';
import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet } from 'utils/wallet';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { WalletInfo } from 'types/wallet';
import { LOGIN, UNLOCK } from 'constants/wallet';
import CommonLink from 'components/CommonLink';
import { AelfExploreType } from 'constants/network';
import { getAelfExploreLink } from 'utils/common';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useGetBalanceDivDecimals } from 'hooks/contract';

export interface WithdrawFooterProps {
  isTransactionFeeLoading: boolean;
  isSubmitDisabled: boolean;
  currentNetwork?: TNetworkItem;
  receiveAmount: string;
  address: string;
  balance: string;
  withdrawInfo: TWithdrawInfo;
  clickFailedOk: () => void;
  clickSuccessOk: () => void;
}

export default function WithdrawFooter({
  isTransactionFeeLoading,
  currentNetwork,
  receiveAmount,
  address,
  balance,
  withdrawInfo,
  isSubmitDisabled,
  clickFailedOk,
  clickSuccessOk,
}: WithdrawFooterProps) {
  const { isPadPX } = useCommonState();
  const { setLoading } = useLoading();
  const { walletInfo, walletType, isLocking, callViewMethod, callSendMethod, getSignature } =
    useConnectWallet();
  const isLogin = useIsLogin();
  const handleLogin = useLogin();
  const accounts = useGetAccount();
  // Fix: It takes too long to obtain NightElf walletInfo, and the user mistakenly clicks the login button during this period.
  const isLoginButtonLoading = useShowLoginButtonLoading();
  const getBalanceDivDecimals = useGetBalanceDivDecimals();
  const { currentChainItem, currentSymbol, tokenList } = useWithdraw();

  // DoubleCheckModal
  const [isDoubleCheckModalOpen, setIsDoubleCheckModalOpen] = useState(false);

  // FailModal
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [failModalReason, setFailModalReason] = useState('');

  // SuccessModal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [withdrawInfoSuccess, setWithdrawInfoSuccess] = useState<TWithdrawInfoSuccess>(
    InitialWithdrawSuccessCheck,
  );

  const currentToken = useMemo(() => {
    const item = tokenList?.find((item) => item.symbol === currentSymbol);
    return item?.symbol ? item : InitialWithdrawState.tokenList[0];
  }, [currentSymbol, tokenList]);

  const currentTokenDecimal = useMemo(() => currentToken.decimals, [currentToken.decimals]);

  const currentTokenAddress = useMemo(
    () => currentToken.contractAddress,
    [currentToken.contractAddress],
  );

  const handleApproveToken = useCallback(async () => {
    const newMaxBalance = await getBalanceDivDecimals(
      currentSymbol,
      currentTokenDecimal,
      currentChainItem.key,
    );
    if (ZERO.plus(newMaxBalance).isLessThan(ZERO.plus(balance))) {
      const error = new Error(
        `Insufficient ${currentSymbol} balance in your account. Please consider transferring a smaller amount or topping up before you try again.`,
      );
      error.name = ErrorNameType.FAIL_MODAL_REASON;
      throw error;
    }

    const checkRes = await checkTokenAllowanceAndApprove({
      callViewMethod,
      callSendMethod,
      chainId: currentChainItem.key,
      symbol: currentSymbol,
      address: accounts?.[currentChainItem.key] || '',
      approveTargetAddress: currentTokenAddress,
      amount: balance,
    });

    return checkRes;
  }, [
    accounts,
    balance,
    callSendMethod,
    callViewMethod,
    currentChainItem.key,
    currentSymbol,
    currentTokenAddress,
    currentTokenDecimal,
    getBalanceDivDecimals,
  ]);

  const handleCreateWithdrawOrder = useCallback(
    async ({ address, rawTransaction }: { address: string; rawTransaction: string }) => {
      try {
        if (!currentNetwork?.network) throw new Error('Please selected network');

        const createWithdrawOrderRes = await createWithdrawOrder({
          network: currentNetwork.network,
          symbol: currentSymbol,
          amount: balance,
          fromChainId: currentChainItem.key,
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
            network: currentNetwork,
            amount: balance,
            symbol: formatSymbolDisplay(currentSymbol),
            chainItem: currentChainItem,
            arriveTime: currentNetwork.multiConfirmTime,
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
    [
      balance,
      currentChainItem,
      currentNetwork,
      currentSymbol,
      receiveAmount,
      setLoading,
      withdrawInfo.receiveAmountUsd,
    ],
  );

  const sendTransferTokenTransaction = useDebounceCallback(async () => {
    try {
      setLoading(true, { text: 'Please approve the transaction in the wallet...' });
      if (!address) throw new Error('Please enter a correct address.');

      const approveRes = await handleApproveToken();
      if (!approveRes) throw new Error(InsufficientAllowanceMessage);
      console.log('>>>>>> sendTransferTokenTransaction approveRes', approveRes);

      if (approveRes) {
        const { caHash } = await getCaHashAndOriginChainIdByWallet(
          walletInfo as WalletInfo,
          walletType,
        );
        const managerAddress = await getManagerAddressByWallet(
          walletInfo as WalletInfo,
          walletType,
        );
        const ownerAddress = accounts?.[currentChainItem.key] || '';
        const transaction = await createTransferTokenTransaction({
          walletType,
          caContractAddress: ADDRESS_MAP[currentChainItem.key][ContractType.CA],
          eTransferContractAddress: currentTokenAddress,
          caHash: caHash,
          symbol: currentSymbol,
          amount: timesDecimals(balance, currentTokenDecimal).toFixed(),
          chainId: currentChainItem.key,
          fromManagerAddress: walletType === WalletTypeEnum.elf ? ownerAddress : managerAddress,
          caAddress: ownerAddress,
          getSignature,
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

  const onSubmit = useCallback(() => {
    if (!currentNetwork) return;
    setIsDoubleCheckModalOpen(true);
  }, [currentNetwork]);

  const onClickSuccess = useCallback(() => {
    setIsSuccessModalOpen(false);
    clickSuccessOk();
  }, [clickSuccessOk]);

  const onClickFailed = useCallback(() => {
    setIsFailModalOpen(false);
    clickFailedOk();
  }, [clickFailedOk]);

  return (
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
            <span className={clsx(styles['info-unit'])}>{withdrawInfo.transactionUnit}</span>
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
      <Form.Item shouldUpdate className={clsx('flex-none', styles['form-submit-button-wrapper'])}>
        {isLogin ? (
          <CommonButton
            className={styles['form-submit-button']}
            // htmlType="submit"
            onClick={onSubmit}
            disabled={isTransactionFeeLoading || !receiveAmount || isSubmitDisabled}>
            {BusinessType.Withdraw}
          </CommonButton>
        ) : (
          <CommonButton
            className={styles['form-submit-button']}
            onClick={handleLogin}
            loading={isLoginButtonLoading}>
            {isLocking ? UNLOCK : LOGIN}
          </CommonButton>
        )}
      </Form.Item>

      <DoubleCheckModal
        withdrawInfo={{
          receiveAmount,
          address,
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
          onClose: onClickSuccess,
          onOk: onClickSuccess,
          footerSlot: CommonLink({
            href: getAelfExploreLink(
              withdrawInfoSuccess.transactionId,
              AelfExploreType.transaction,
              currentChainItem.key,
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
          onClose: onClickFailed,
          onOk: onClickFailed,
        }}
      />
    </div>
  );
}
