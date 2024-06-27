import React, { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import CommonAddress from 'components/CommonAddress';
import DepositInfo from 'pageComponents/DepositContent/DepositInfo';
import DepositDescription from 'pageComponents/DepositContent/DepositDescription';
import styles from './styles.module.scss';
import { TDepositContentProps } from '..';
import CommonQRCode from 'components/CommonQRCode';
import { DEPOSIT_ADDRESS_LABEL } from 'constants/deposit';
import CommonImage from 'components/CommonImage';
import { qrCodePlaceholder } from 'assets/images';
import { DepositRetryForMobile } from 'pageComponents/DepositContent/DepositRetry';
import SelectTokenNetwork from '../SelectTokenNetwork';
import SelectTokenChain from '../SelectTokenChain';
import Space from 'components/Space';
import Calculator from '../Calculator';
import ExchangeRate from '../ExchangeRate';
import { useCommonState, useDepositState } from 'store/Provider/hooks';
import FAQ from 'components/FAQ';
import { FAQ_DEPOSIT } from 'constants/footer';
import DepositTip from '../DepositTip';
import CommonDrawer from 'components/CommonDrawer';
import CommonButton from 'components/CommonButton';

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
  onRetry,
  toTokenSelectCallback,
  toChainChanged,
  fromNetworkChanged,
  fromTokenChanged,
  onNext,
}: TDepositContentProps & { onNext: () => Promise<void> }) {
  const { fromTokenSymbol, toChainItem, toTokenSymbol } = useDepositState();
  const { isPadPX, isMobilePX } = useCommonState();
  const nextDisable = useMemo(
    () => !fromTokenSymbol || !toTokenSymbol || !toChainItem.key || !fromNetworkSelected,
    [fromNetworkSelected, fromTokenSymbol, toChainItem.key, toTokenSymbol],
  );

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
        <Space direction="vertical" size={16} />
        {showRetry && <DepositRetryForMobile onClick={onRetry} />}
        {!showRetry && depositInfo?.depositAddress && (
          <CommonAddress label={DEPOSIT_ADDRESS_LABEL} value={depositInfo.depositAddress} />
        )}
      </div>
    );
  }, [depositInfo.depositAddress, onRetry, qrCodeValue, showRetry, tokenLogoUrl]);

  const renderDepositDescription = useMemo(() => {
    return (
      Array.isArray(depositInfo?.extraNotes) &&
      depositInfo?.extraNotes.length > 0 && <DepositDescription list={depositInfo.extraNotes} />
    );
  }, [depositInfo.extraNotes]);

  const [isShowDepositInfo, setIsShowDepositInfo] = useState(false);
  const renderDepositInfoDrawer = useMemo(() => {
    return (
      <CommonDrawer
        id="mobileDepositInfoDrawer"
        className={styles['deposit-info-drawer']}
        open={isShowDepositInfo}
        onClose={() => setIsShowDepositInfo(false)}
        destroyOnClose
        placement="bottom"
        title="Deposit Address"
        closable={true}
        height="88%">
        {fromTokenSymbol && toTokenSymbol && (
          <DepositTip fromToken={fromTokenSymbol} toToken={toTokenSymbol} isShowIcon={false} />
        )}

        <Space direction="vertical" size={16} />

        {fromTokenSelected && fromNetworkSelected && renderDepositAddress}

        <Space direction="vertical" size={12} />

        {fromTokenSelected && fromNetworkSelected && depositInfo?.depositAddress && (
          <>
            <DepositInfo
              modalContainer={'#mobileDepositInfoDrawer'}
              networkName={fromNetworkSelected.name}
              minimumDeposit={depositInfo.minAmount}
              contractAddress={contractAddress}
              contractAddressLink={contractAddressLink}
              minAmountUsd={depositInfo.minAmountUsd}
            />
            <Space direction="vertical" size={24} />
            {renderDepositDescription}
          </>
        )}
      </CommonDrawer>
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
    isShowDepositInfo,
    renderDepositAddress,
    renderDepositDescription,
    toTokenSymbol,
  ]);

  const onClickNext = useCallback(async () => {
    await onNext();
    setIsShowDepositInfo(true);
  }, [onNext]);

  return (
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

        <Space direction="vertical" size={8} />

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
              <Space direction="vertical" size={12} />
              <ExchangeRate
                fromSymbol={fromTokenSymbol}
                toSymbol={toTokenSymbol}
                toChainId={toChainItem.key}
                slippage={depositInfo.extraInfo?.slippage}
              />
            </>
          )}

        {fromTokenSymbol !== toTokenSymbol && (
          <>
            <Space direction="vertical" size={24} />

            <Calculator />
          </>
        )}

        <div
          className={clsx(styles['next-button-wrapper'], styles['next-button-wrapper-safe-area'])}>
          <Space direction="vertical" size={24} />
          <CommonButton
            className={styles['next-button']}
            onClick={onClickNext}
            disabled={nextDisable}>
            Next
          </CommonButton>
        </div>
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
      {renderDepositInfoDrawer}
    </div>
  );
}
