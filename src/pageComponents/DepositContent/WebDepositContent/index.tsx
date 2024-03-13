import React, { useMemo } from 'react';
import clsx from 'clsx';
import SelectChainWrapper from 'pageComponents/SelectChainWrapper';
import CommonAddress from 'components/CommonAddress';
import SelectNetwork from 'pageComponents/SelectNetwork';
import DepositInfo from 'pageComponents/DepositContent/DepositInfo';
import DepositDescription from 'pageComponents/DepositContent/DepositDescription';
import styles from './styles.module.scss';
import { DepositContentProps } from '..';
import CommonQRCode from 'components/CommonQRCode';
import { DEPOSIT_ADDRESS_LABEL } from 'constants/deposit';
import { useDeposit } from 'hooks/deposit';
import CommonImage from 'components/CommonImage';
import { qrCodePlaceholder } from 'assets/images';
import { SideMenuKey } from 'constants/home';
import { DepositRetryForWeb } from 'pageComponents/DepositContent/DepositRetry';
import SelectToken from 'pageComponents/SelectToken';

export default function WebContent({
  networkList,
  depositInfo,
  contractAddress,
  contractAddressLink,
  qrCodeValue,
  networkSelected,
  tokenLogoUrl,
  showRetry = false,
  isShowLoading = false,
  currentToken,
  tokenList,
  onRetry,
  chainChanged,
  networkChanged,
  onTokenChanged,
}: DepositContentProps) {
  const { currentSymbol } = useDeposit();
  const renderDepositDescription = useMemo(() => {
    return (
      Array.isArray(depositInfo?.extraNotes) &&
      depositInfo?.extraNotes.length > 0 && <DepositDescription list={depositInfo.extraNotes} />
    );
  }, [depositInfo.extraNotes]);

  return (
    <>
      <SelectChainWrapper webLabel={'Deposit Tokens to'} chainChanged={chainChanged} />
      <div className={styles['select-network-wrapper']}>
        <SelectToken
          type={SideMenuKey.Deposit}
          selected={currentToken}
          selectCallback={onTokenChanged}
          tokenList={tokenList}
        />
      </div>
      <div
        className={clsx(
          styles['select-network-wrapper'],
          currentSymbol === '' && styles['select-network-hidden'],
        )}>
        <SelectNetwork
          type={SideMenuKey.Deposit}
          networkList={networkList}
          selectCallback={networkChanged}
          selected={networkSelected}
          isShowLoading={isShowLoading}
        />
      </div>
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
          <div className={styles['info-wrapper']}>
            <DepositInfo
              minimumDeposit={depositInfo.minAmount}
              contractAddress={contractAddress}
              contractAddressLink={contractAddressLink}
              minAmountUsd={depositInfo.minAmountUsd || ''}
            />
          </div>
          {renderDepositDescription}
        </>
      )}
    </>
  );
}
