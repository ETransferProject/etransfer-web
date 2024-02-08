import React, { useMemo } from 'react';
import clsx from 'clsx';
import SelectChainWrapper from 'pageComponents/SelectChainWrapper';
import CommonAddress from 'components/CommonAddress';
import SelectNetwork from 'pageComponents/SelectNetwork';
import DepositInfo from 'pageComponents/Deposit/DepositInfo';
import DepositDescription from 'pageComponents/Deposit/DepositDescription';
import styles from './styles.module.scss';
import { DepositContentProps } from '..';
import CommonQRCode from 'components/CommonQRCode';
import { DEPOSIT_ADDRESS_LABEL } from 'constants/deposit';
import { useTokenState } from 'store/Provider/hooks';
import CommonImage from 'components/CommonImage';
import { qrCodePlaceholder } from 'assets/images';
import { SideMenuKey } from 'constants/home';
import { DepositRetryForWeb } from 'pageComponents/DepositRetry';

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
  onRetry,
  chainChanged,
  networkChanged,
}: DepositContentProps) {
  const { currentSymbol } = useTokenState();
  const webLabel = useMemo(() => `Deposit ${currentSymbol} to`, [currentSymbol]);
  const renderDepositDescription = useMemo(() => {
    return (
      Array.isArray(depositInfo?.extraNotes) &&
      depositInfo?.extraNotes.length > 0 && <DepositDescription list={depositInfo.extraNotes} />
    );
  }, [depositInfo.extraNotes]);

  return (
    <>
      <SelectChainWrapper webLabel={webLabel} chainChanged={chainChanged} />
      <div className={styles['select-network-wrapper']}>
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
            />
          </div>
          {renderDepositDescription}
        </>
      )}
    </>
  );
}
