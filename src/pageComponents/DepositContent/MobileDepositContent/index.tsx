import React from 'react';
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
import CommonImage from 'components/CommonImage';
import { qrCodePlaceholder } from 'assets/images';
import { SideMenuKey } from 'constants/home';
import { DepositRetryForMobile } from 'pageComponents/DepositRetry';

export default function MobileDepositContent({
  networkList,
  depositInfo,
  contractAddress,
  contractAddressLink,
  qrCodeValue,
  networkSelected,
  tokenLogoUrl,
  showRetry = false,
  onRetry,
  chainChanged,
  networkChanged,
}: DepositContentProps) {
  const renderSelectNetwork = ({ noBorder }: { noBorder?: boolean } = {}) => {
    return (
      <SelectNetwork
        type={SideMenuKey.Deposit}
        networkList={networkList}
        selectCallback={networkChanged}
        selected={networkSelected}
        noBorder={noBorder}
      />
    );
  };

  return (
    <>
      <SelectChainWrapper
        className={styles['deposit-select-chain-wrapper']}
        mobileTitle="Deposit to"
        mobileLabel="to"
        chainChanged={chainChanged}
      />
      <div className={clsx('flex-column', styles['content-wrapper'])}>
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
        {networkSelected ? (
          <>
            <div className={styles['data-wrapper']}>
              {renderSelectNetwork({ noBorder: true })}
              <div className={styles['data-divider']} />
              <div className={styles['data-address-wrapper']}>
                {showRetry && <DepositRetryForMobile onClick={onRetry} />}
                {!showRetry && depositInfo?.depositAddress && (
                  <CommonAddress label={DEPOSIT_ADDRESS_LABEL} value={depositInfo.depositAddress} />
                )}
              </div>
            </div>
            {depositInfo?.depositAddress && (
              <>
                <div className={styles['info-wrapper']}>
                  <DepositInfo
                    minimumDeposit={depositInfo.minAmount}
                    contractAddress={contractAddress}
                    contractAddressLink={contractAddressLink}
                  />
                </div>
                {Array.isArray(depositInfo?.extraNotes) && depositInfo?.extraNotes.length > 0 && (
                  <DepositDescription list={depositInfo.extraNotes} />
                )}
              </>
            )}
          </>
        ) : (
          renderSelectNetwork()
        )}
      </div>
    </>
  );
}
