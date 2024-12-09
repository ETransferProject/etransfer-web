import React, { useMemo } from 'react';
import clsx from 'clsx';
import CommonAddress from 'components/CommonAddress';
import DepositInfo from 'pageComponents/DepositContent/DepositInfo';
import DepositDescription from 'pageComponents/DepositContent/DepositDescription';
import styles from './styles.module.scss';
import { TDepositContentProps } from '..';
import CommonQRCode from 'components/CommonQRCode';
import {
  CHECK_TXN_BUTTON,
  CHECKING_TXN_BUTTON,
  DEPOSIT_ADDRESS_LABEL,
  DEPOSIT_PAGE_TITLE,
} from 'constants/deposit';
import CommonImage from 'components/CommonImage';
import { DoubleArrowIcon, qrCodePlaceholder } from 'assets/images';
import { DepositRetryForWeb } from 'pageComponents/DepositContent/DepositRetry';
import CommonSpace from 'components/CommonSpace';
import ExchangeRate from '../ExchangeRate';
import Calculator from '../Calculator';
import { useDepositState } from 'store/Provider/hooks';
import FAQ from 'components/FAQ';
import { FAQ_DEPOSIT } from 'constants/footer';
import SelectToken from '../SelectToken';
import SelectNetwork from '../SelectNetwork';
import { CHAIN_LIST, SUPPORT_DEPOSIT_ISOMORPHIC_CHAIN_GUIDE, TokenType } from 'constants/index';
import SelectChainWrapper from '../SelectChainWrapper';
import DepositTip from '../DepositTip';
import { CopySize } from 'components/Copy';
import NotLoginTip from '../NotLoginTip';
import useAelf, { useAelfLogin } from 'hooks/wallet/useAelf';
import { useDepositNetworkList } from 'hooks/deposit';
import TransferTip from '../TransferTip';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { AelfChainIdList } from 'constants/chain';
import CommonButton, { CommonButtonSize } from 'components/CommonButton';
import { ProcessingTip } from 'components/Tips/ProcessingTip';
import { CONNECT_AELF_WALLET } from 'constants/wallet';

export default function WebContent({
  fromNetworkSelected,
  depositInfo,
  contractAddress,
  contractAddressLink,
  qrCodeValue,
  tokenLogoUrl,
  showRetry = false,
  fromTokenSelected,
  toTokenSelected,
  isCheckTxnLoading = false,
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
  const { isConnected } = useAelf();
  const handleAelfLogin = useAelfLogin();

  const {
    fromTokenSymbol,
    toChainItem,
    toTokenSymbol,
    fromTokenList,
    toTokenList,
    toChainList,
    fromNetwork,
  } = useDepositState();
  const getFromNetworkList = useDepositNetworkList();
  const newFromNetworkList = useMemo(() => {
    return getFromNetworkList(fromTokenSymbol, toTokenSymbol);
  }, [fromTokenSymbol, getFromNetworkList, toTokenSymbol]);

  const isShowNotLoginTip = useMemo(() => {
    return (
      !isConnected &&
      !!fromTokenSymbol &&
      !!toTokenSymbol &&
      !!fromNetwork?.network &&
      !!toChainItem.key
    );
  }, [fromNetwork?.network, fromTokenSymbol, isConnected, toChainItem.key, toTokenSymbol]);

  const isShowTransferTip = useMemo(() => {
    return (
      isConnected &&
      SUPPORT_DEPOSIT_ISOMORPHIC_CHAIN_GUIDE.includes(fromTokenSymbol as TokenType) &&
      fromTokenSymbol === toTokenSymbol &&
      AelfChainIdList.includes(fromNetwork?.network as TChainId)
    );
  }, [fromNetwork?.network, fromTokenSymbol, isConnected, toTokenSymbol]);

  const isShowDepositAddressLabelForLogin = useMemo(() => {
    return showRetry || !!depositInfo.depositAddress;
  }, [depositInfo.depositAddress, showRetry]);
  const isShowDepositAddressLabelForNotLogin = useMemo(() => {
    return (
      !showRetry &&
      fromTokenSymbol &&
      toChainItem.key &&
      toTokenSymbol &&
      fromNetworkSelected?.network &&
      !isConnected
    );
  }, [
    fromNetworkSelected?.network,
    fromTokenSymbol,
    isConnected,
    showRetry,
    toChainItem.key,
    toTokenSymbol,
  ]);

  const renderDepositDescription = useMemo(() => {
    return (
      Array.isArray(depositInfo?.extraNotes) &&
      depositInfo?.extraNotes.length > 0 && <DepositDescription list={depositInfo.extraNotes} />
    );
  }, [depositInfo.extraNotes]);

  const menuItems = useMemo(() => toChainList || CHAIN_LIST, [toChainList]);

  const renderSelectTokens = useMemo(() => {
    return (
      <div className={clsx('flex-row-center', styles['selected-data-wrapper'])}>
        <div className={clsx(styles['selected-token-wrapper'])}>
          <div className={styles['label']}>Deposit Token</div>
          <SelectToken
            className={styles['selected-token']}
            tokenList={fromTokenList}
            selected={fromTokenSelected}
            selectCallback={fromTokenChanged}
          />
        </div>
        <div className={styles['space']}></div>
        <div className={clsx(styles['selected-token-wrapper'])}>
          <div className={styles['label']}>Receive Token</div>
          <SelectToken
            className={styles['selected-token']}
            tokenList={toTokenList}
            selected={toTokenSelected}
            selectCallback={toTokenSelectCallback}
          />
        </div>
      </div>
    );
  }, [
    fromTokenChanged,
    fromTokenList,
    fromTokenSelected,
    toTokenList,
    toTokenSelectCallback,
    toTokenSelected,
  ]);

  const renderSelectNetworks = useMemo(() => {
    return (
      <div
        className={clsx(
          'flex-row-center',
          styles['selected-data-wrapper'],
          styles['selected-row-2'],
        )}>
        <div className={clsx(styles['selected-chain-wrapper'])}>
          <div className={styles['label']}>From</div>
          <SelectNetwork
            className={styles['selected-chain']}
            networkList={newFromNetworkList || []}
            selected={fromNetworkSelected}
            selectCallback={fromNetworkChanged}
          />
        </div>
        <div className={styles['space']}></div>
        <div
          className={clsx('position-relative', styles['selected-chain-wrapper'])}
          id="webDepositChainWrapper">
          <div className={clsx('flex-row-center-between', styles['label'])}>
            <span>To</span>
            <div className="flex-row-center">
              {isConnected ? (
                <>
                  <div className={styles['circle']} />
                  <span className={styles['connected']}>Connected</span>
                </>
              ) : (
                <span className={styles['connect']} onClick={() => handleAelfLogin()}>
                  {CONNECT_AELF_WALLET}
                </span>
              )}
            </div>
          </div>

          <SelectChainWrapper
            className={styles['selected-chain']}
            menuItems={menuItems}
            selectedItem={toChainItem}
            chainChanged={toChainChanged}
          />
        </div>
      </div>
    );
  }, [
    fromNetworkChanged,
    fromNetworkSelected,
    handleAelfLogin,
    isConnected,
    menuItems,
    newFromNetworkList,
    toChainChanged,
    toChainItem,
  ]);

  const renderSelectSection = useMemo(() => {
    return (
      <>
        {renderSelectTokens}
        <div className={clsx('row-center', styles['arrow-right'])}>
          <DoubleArrowIcon />
        </div>
        {renderSelectNetworks}
      </>
    );
  }, [renderSelectNetworks, renderSelectTokens]);

  const renderCalculationSection = useMemo(() => {
    return (
      <>
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
      </>
    );
  }, [fromTokenSymbol, toChainItem.key, toTokenSymbol]);

  const renderDepositInfo = useMemo(() => {
    return (
      <>
        <CommonSpace direction="vertical" size={4} />
        <DepositTip fromToken={fromTokenSymbol} toToken={toTokenSymbol} />
        <CommonSpace direction="vertical" size={12} />
        <div className={clsx('flex-row-center', styles['deposit-address-wrapper'])}>
          {qrCodeValue ? (
            <CommonQRCode value={qrCodeValue} logoUrl={tokenLogoUrl} logoSize={20} />
          ) : (
            <CommonImage
              className={clsx('flex-none', styles['qr-code-placeholder'])}
              src={qrCodePlaceholder}
              alt="qrCodePlaceholder"
            />
          )}
          <div>
            <CommonAddress
              label={DEPOSIT_ADDRESS_LABEL}
              value={depositInfo.depositAddress}
              copySize={CopySize.Big}
            />

            <CommonButton
              className={styles['check-txn-btn']}
              size={CommonButtonSize.ExtraSmall}
              onClick={onCheckTxnClick}
              loading={isCheckTxnLoading}>
              {isCheckTxnLoading ? CHECKING_TXN_BUTTON : CHECK_TXN_BUTTON}
            </CommonButton>
          </div>
        </div>
        <CommonSpace direction="vertical" size={12} />
        <DepositInfo
          minimumDeposit={depositInfo.minAmount}
          contractAddress={contractAddress}
          contractAddressLink={contractAddressLink}
          minAmountUsd={depositInfo.minAmountUsd || ''}
        />
        <CommonSpace direction="vertical" size={24} />
        {renderDepositDescription}
      </>
    );
  }, [
    contractAddress,
    contractAddressLink,
    depositInfo.depositAddress,
    depositInfo.minAmount,
    depositInfo.minAmountUsd,
    fromTokenSymbol,
    isCheckTxnLoading,
    onCheckTxnClick,
    qrCodeValue,
    renderDepositDescription,
    toTokenSymbol,
    tokenLogoUrl,
  ]);

  const renderDepositMainContent = useMemo(() => {
    return (
      <div
        className={clsx(
          'main-content-container',
          'main-content-container-safe-area',
          styles['main-content'],
        )}>
        {isConnected && (
          <ProcessingTip
            depositProcessingCount={depositProcessingCount}
            transferProcessingCount={transferProcessingCount}
            onClick={onClickProcessingTip}
          />
        )}

        <div className="main-section-header">{DEPOSIT_PAGE_TITLE}</div>

        {renderSelectSection}

        {renderCalculationSection}

        <CommonSpace direction="vertical" size={40} />

        {isShowTransferTip && (
          <>
            <div className={clsx(styles['label'], styles['label-deposit-address'])}>Transfer</div>
            <TransferTip
              symbol={fromTokenSymbol}
              fromNetwork={fromNetworkSelected?.network}
              toNetwork={toChainItem.key}
            />
            <CommonSpace direction="vertical" size={24} />
          </>
        )}

        {!isShowTransferTip && (
          <>
            {(isShowDepositAddressLabelForLogin || isShowDepositAddressLabelForNotLogin) && (
              <div className={clsx(styles['label'], styles['label-deposit-address'])}>
                Deposit address
              </div>
            )}
            {isShowNotLoginTip && <NotLoginTip />}
            {isConnected && showRetry && (
              <DepositRetryForWeb isShowImage={true} onClick={onRetry} />
            )}
            {isConnected && !showRetry && !!depositInfo.depositAddress && renderDepositInfo}
          </>
        )}
      </div>
    );
  }, [
    depositInfo.depositAddress,
    depositProcessingCount,
    fromNetworkSelected,
    fromTokenSymbol,
    isConnected,
    isShowDepositAddressLabelForLogin,
    isShowDepositAddressLabelForNotLogin,
    isShowNotLoginTip,
    isShowTransferTip,
    onClickProcessingTip,
    onRetry,
    renderCalculationSection,
    renderDepositInfo,
    renderSelectSection,
    showRetry,
    toChainItem,
    transferProcessingCount,
  ]);

  return (
    <div className="content-container flex-row">
      <div className={styles['main-container']}>
        <div className={styles['main-wrapper']}>{renderDepositMainContent}</div>
      </div>
      <div className={clsx('flex-row', styles['faq-wrapper'])}>
        <FAQ className={styles['faq']} title={FAQ_DEPOSIT.title} list={FAQ_DEPOSIT.list} />
      </div>
    </div>
  );
}
