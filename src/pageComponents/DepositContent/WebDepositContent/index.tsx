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
import { DepositRetryForWeb } from 'pageComponents/DepositContent/DepositRetry';
import SelectTokenNetwork from '../SelectTokenNetwork';
import SelectTokenChain from '../SelectTokenChain';
import Space from 'components/Space';
import ExchangeRate from '../ExchangeRate';
import Calculator from '../Calculator';
import { useDepositState } from 'store/Provider/hooks';
import { TokenType } from 'constants/index';

export default function WebContent({
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

  const renderDepositDescription = useMemo(() => {
    return (
      Array.isArray(depositInfo?.extraNotes) &&
      depositInfo?.extraNotes.length > 0 && <DepositDescription list={depositInfo.extraNotes} />
    );
  }, [depositInfo.extraNotes]);

  return (
    <>
      <div className={styles['deposit-title']}>Deposit Assets</div>
      <SelectTokenNetwork
        label={'From'}
        tokenSelected={fromTokenSelected}
        tokenSelectCallback={fromTokenChanged}
        networkSelected={fromNetworkSelected}
        isShowNetworkLoading={isShowNetworkLoading}
        networkSelectCallback={fromNetworkChanged}
      />
      <Space direction="vertical" size={12} />
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
          <Calculator payToken={TokenType.USDT} receiveToken={TokenType.SGR} />
        </>
      )}

      <Space direction="vertical" size={24} />
      {showRetry && <DepositRetryForWeb isShowImage={true} onClick={onRetry} />}
      {!showRetry && !!depositInfo.depositAddress && (
        <>
          <div className={clsx('flex-row-center', styles['deposit-address-wrapper'])}>
            {qrCodeValue ? (
              <CommonQRCode value={qrCodeValue} logoUrl={tokenLogoUrl} />
            ) : (
              <CommonImage
                className={clsx('flex-none', styles['qr-code-placeholder'])}
                src={qrCodePlaceholder}
                alt="qrCodePlaceholder"
              />
            )}
            <CommonAddress label={DEPOSIT_ADDRESS_LABEL} value={depositInfo.depositAddress} />
          </div>
          <Space direction="vertical" size={12} />
          <DepositInfo
            minimumDeposit={depositInfo.minAmount}
            contractAddress={contractAddress}
            contractAddressLink={contractAddressLink}
            minAmountUsd={depositInfo.minAmountUsd || ''}
          />
          <Space direction="vertical" size={24} />
          {renderDepositDescription}
        </>
      )}
    </>
  );
}
