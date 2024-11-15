import React, { useCallback, useMemo } from 'react';
import clsx from 'clsx';
import CommonAddress from 'components/CommonAddress';
import DepositInfo from 'pageComponents/DepositContent/DepositInfo';
import DepositDescription from 'pageComponents/DepositContent/DepositDescription';
import styles from './styles.module.scss';
import { TDepositContentProps } from '..';
import CommonQRCode from 'components/CommonQRCode';
import { CHECK_TXN_BUTTON, CHECKING_TXN_BUTTON, DEPOSIT_ADDRESS_LABEL } from 'constants/deposit';
import CommonImage from 'components/CommonImage';
import { qrCodePlaceholder } from 'assets/images';
import { DepositRetryForMobile } from 'pageComponents/DepositContent/DepositRetry';
import SelectTokenNetwork from '../SelectTokenNetwork';
import SelectTokenChain from '../SelectTokenChain';
import CommonSpace from 'components/CommonSpace';
import Calculator from '../Calculator';
import ExchangeRate from '../ExchangeRate';
import { useCommonState, useDepositState } from 'store/Provider/hooks';
import FAQ from 'components/FAQ';
import { FAQ_DEPOSIT } from 'constants/footer';
import DepositTip from '../DepositTip';
import CommonButton, { CommonButtonSize } from 'components/CommonButton';
import { CopySize } from 'components/Copy';
import useAelf, { useLogin, useShowLoginButtonLoading } from 'hooks/wallet/useAelf';
import { LOGIN, UNLOCK } from 'constants/wallet/index';
import { SUPPORT_DEPOSIT_ISOMORPHIC_CHAIN_GUIDE, TokenType } from 'constants/index';
import TransferTip from '../TransferTip';
import { useGoTransfer } from 'hooks/crossChainTransfer';
import { AelfChainIdList } from 'constants/chain';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { ProcessingTip } from 'components/Tips/ProcessingTip';

export default function MobileDepositContent({
  fromNetworkSelected,
  depositInfo,
  contractAddress,
  contractAddressLink,
  qrCodeValue,
  tokenLogoUrl,
  showRetry = false,
  isShowNetworkLoading = false,
  fromTokenSelected,
  toTokenSelected,
  isCheckTxnLoading,
  depositProcessingCount,
  transferProcessingCount,
  onRetry,
  onCheckTxnClick,
  onClickProcessingTip,
  toTokenSelectCallback,
  toChainChanged,
  fromNetworkChanged,
  fromTokenChanged,
}: TDepositContentProps) {
  // common info
  const { isPadPX, isMobilePX } = useCommonState();

  // deposit info
  const { toChainItem } = useDepositState();
  const fromTokenSymbol = useMemo(
    () => fromTokenSelected?.symbol || '',
    [fromTokenSelected?.symbol],
  );
  const toTokenSymbol = useMemo(() => toTokenSelected?.symbol || '', [toTokenSelected?.symbol]);
  const fromNetwork = useMemo(() => fromNetworkSelected, [fromNetworkSelected]);

  // login info
  const { isConnected, isLocking } = useAelf();
  const handleLogin = useLogin();
  // Fix: It takes too long to obtain NightElf walletInfo, and the user mistakenly clicks the login button during this period.
  const isLoginButtonLoading = useShowLoginButtonLoading();

  const renderDepositAddress = useMemo(() => {
    return (
      <div className={styles['deposit-address']}>
        <div className={clsx('flex-row-content-center', styles['QR-code-wrapper'])}>
          {qrCodeValue ? (
            <CommonQRCode value={qrCodeValue} logoUrl={tokenLogoUrl} />
          ) : (
            <CommonImage
              className={clsx('flex-none', styles['qr-code-placeholder'])}
              src={qrCodePlaceholder}
              alt="qrCodePlaceholder"
            />
          )}
        </div>
        <CommonSpace direction="vertical" size={16} />
        {isConnected && showRetry && <DepositRetryForMobile onClick={onRetry} />}
        {isConnected && !showRetry && !!depositInfo?.depositAddress && (
          <CommonAddress
            label={DEPOSIT_ADDRESS_LABEL}
            value={depositInfo.depositAddress}
            copySize={CopySize.Big}
          />
        )}
        {isConnected && !showRetry && !!depositInfo.depositAddress && (
          <div className="flex-center">
            <CommonButton
              className={styles['check-txn-btn']}
              size={CommonButtonSize.ExtraSmall}
              onClick={onCheckTxnClick}
              loading={isCheckTxnLoading}>
              {isCheckTxnLoading ? CHECKING_TXN_BUTTON : CHECK_TXN_BUTTON}
            </CommonButton>
          </div>
        )}
      </div>
    );
  }, [
    depositInfo.depositAddress,
    isCheckTxnLoading,
    isConnected,
    onCheckTxnClick,
    onRetry,
    qrCodeValue,
    showRetry,
    tokenLogoUrl,
  ]);

  const renderDepositDescription = useMemo(() => {
    return (
      Array.isArray(depositInfo?.extraNotes) &&
      depositInfo?.extraNotes.length > 0 && <DepositDescription list={depositInfo.extraNotes} />
    );
  }, [depositInfo.extraNotes]);

  const isShowDepositTip = useMemo(() => {
    return (
      !!fromTokenSymbol &&
      !!toTokenSymbol &&
      !!fromNetwork?.network &&
      !!toChainItem.key &&
      !!depositInfo.depositAddress
    );
  }, [
    depositInfo.depositAddress,
    fromNetwork?.network,
    fromTokenSymbol,
    toChainItem.key,
    toTokenSymbol,
  ]);

  const renderDepositInfo = useMemo(() => {
    return (
      <div>
        {isShowDepositTip && (
          <>
            <DepositTip fromToken={fromTokenSymbol} toToken={toTokenSymbol} isShowIcon={false} />
            <CommonSpace direction="vertical" size={16} />
          </>
        )}

        {fromTokenSelected && fromNetworkSelected && renderDepositAddress}

        <CommonSpace direction="vertical" size={12} />

        {fromTokenSelected && fromNetworkSelected && !!depositInfo?.depositAddress && (
          <>
            <DepositInfo
              modalContainer={'#mobileDepositInfoDrawer'}
              networkName={fromNetworkSelected.name}
              minimumDeposit={depositInfo.minAmount}
              contractAddress={contractAddress}
              contractAddressLink={contractAddressLink}
              minAmountUsd={depositInfo.minAmountUsd}
            />
            <CommonSpace direction="vertical" size={24} />
            {renderDepositDescription}
          </>
        )}
      </div>
    );
  }, [
    contractAddress,
    contractAddressLink,
    depositInfo?.depositAddress,
    depositInfo.minAmount,
    depositInfo.minAmountUsd,
    fromNetworkSelected,
    fromTokenSelected,
    fromTokenSymbol,
    isShowDepositTip,
    renderDepositAddress,
    renderDepositDescription,
    toTokenSymbol,
  ]);

  const isShowTransferTip = useMemo(() => {
    return (
      isConnected &&
      SUPPORT_DEPOSIT_ISOMORPHIC_CHAIN_GUIDE.includes(fromTokenSymbol as TokenType) &&
      fromTokenSymbol === toTokenSymbol &&
      AelfChainIdList.includes(fromNetwork?.network as TChainId)
    );
  }, [fromNetwork?.network, fromTokenSymbol, isConnected, toTokenSymbol]);

  const goTransfer = useGoTransfer();
  const handleGoTransfer = useCallback(async () => {
    goTransfer(fromTokenSymbol, fromNetwork?.network, toChainItem.key);
  }, [fromNetwork?.network, fromTokenSymbol, goTransfer, toChainItem.key]);

  return (
    <>
      {isConnected && (
        <ProcessingTip
          depositProcessingCount={depositProcessingCount}
          transferProcessingCount={transferProcessingCount}
          marginBottom={isPadPX && !isMobilePX ? 24 : 0}
          borderRadius={0}
          onClick={onClickProcessingTip}
        />
      )}

      <div className="main-content-container main-content-container-safe-area">
        <div className={clsx(styles['main-section'], styles['section'])}>
          <SelectTokenNetwork
            label={'From'}
            tokenSelected={fromTokenSelected}
            tokenSelectCallback={fromTokenChanged}
            networkSelected={fromNetworkSelected}
            isShowNetworkLoading={isShowNetworkLoading}
            networkSelectCallback={fromNetworkChanged}
          />

          <CommonSpace direction="vertical" size={8} />

          <SelectTokenChain
            label={'To'}
            tokenSelected={toTokenSelected}
            tokenSelectCallback={toTokenSelectCallback}
            chainChanged={toChainChanged}
          />

          {fromTokenSymbol &&
            toTokenSymbol &&
            toChainItem.key &&
            fromTokenSymbol !== toTokenSymbol && (
              <>
                <CommonSpace direction="vertical" size={12} />
                <ExchangeRate
                  fromSymbol={fromTokenSymbol}
                  toSymbol={toTokenSymbol}
                  toChainId={toChainItem.key}
                />
              </>
            )}

          {fromTokenSymbol !== toTokenSymbol && (
            <>
              <CommonSpace direction="vertical" size={24} />

              <Calculator />
            </>
          )}

          <CommonSpace direction="vertical" size={24} />

          {!isShowTransferTip && isConnected && renderDepositInfo}

          {!isConnected && (
            <div
              className={clsx(
                styles['next-button-wrapper'],
                styles['next-button-wrapper-safe-area'],
              )}>
              <CommonSpace direction="vertical" size={24} />
              <CommonButton
                className={styles['next-button']}
                onClick={handleLogin}
                loading={isLoginButtonLoading}>
                {isLocking ? UNLOCK : LOGIN}
              </CommonButton>
            </div>
          )}
          {isConnected && isShowTransferTip && (
            <div
              className={clsx(
                styles['next-button-wrapper'],
                styles['next-button-wrapper-safe-area'],
              )}>
              <CommonSpace direction="vertical" size={24} />
              <TransferTip
                isShowIcon={false}
                symbol={fromTokenSymbol}
                fromNetwork={fromNetwork?.network}
                toNetwork={toChainItem.key}
              />
              <CommonSpace direction="vertical" size={24} />
              <CommonButton className={styles['next-button']} onClick={handleGoTransfer}>
                Go to Transfer Page
              </CommonButton>
            </div>
          )}
        </div>
        {isPadPX && !isMobilePX && (
          <>
            <div className={styles['divider']} />
            <FAQ
              className={clsx(styles['section'], styles['faq'])}
              title={FAQ_DEPOSIT.title}
              list={FAQ_DEPOSIT.list}
            />
          </>
        )}
      </div>
    </>
  );
}
