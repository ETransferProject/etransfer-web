import React, { useMemo } from 'react';
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
import { useDepositState } from 'store/Provider/hooks';

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
}: TDepositContentProps) {
  const { fromTokenSymbol, toChainItem, toTokenSymbol } = useDepositState();

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

  return (
    <div className="main-content-container main-content-container-safe-area">
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

      {fromTokenSymbol && toTokenSymbol && toChainItem.key && fromTokenSymbol !== toTokenSymbol && (
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

      <Space direction="vertical" size={24} />

      {fromTokenSelected && fromNetworkSelected && renderDepositAddress}

      <Space direction="vertical" size={12} />

      {fromTokenSelected && fromNetworkSelected && depositInfo?.depositAddress && (
        <>
          <DepositInfo
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
    </div>
  );
}
