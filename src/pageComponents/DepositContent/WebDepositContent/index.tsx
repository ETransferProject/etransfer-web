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
import { DoubleArrowIcon, qrCodePlaceholder } from 'assets/images';
import { DepositRetryForWeb } from 'pageComponents/DepositContent/DepositRetry';
import Space from 'components/Space';
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
import { useIsLogin, useLogin } from 'hooks/wallet';
import { useDepositNetworkList } from 'hooks/deposit';
import TransferTip from '../TransferTip';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { AelfChainIdList } from 'constants/chain';

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
  const isLogin = useIsLogin();
  const handleLogin = useLogin();

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
      !isLogin &&
      !!fromTokenSymbol &&
      !!toTokenSymbol &&
      !!fromNetwork?.network &&
      !!toChainItem.key
    );
  }, [fromNetwork?.network, fromTokenSymbol, isLogin, toChainItem.key, toTokenSymbol]);

  const isShowTransferTip = useMemo(() => {
    return (
      isLogin &&
      SUPPORT_DEPOSIT_ISOMORPHIC_CHAIN_GUIDE.includes(fromTokenSymbol as TokenType) &&
      fromTokenSymbol === toTokenSymbol &&
      AelfChainIdList.includes(fromNetwork?.network as TChainId)
    );
  }, [fromNetwork?.network, fromTokenSymbol, isLogin, toTokenSymbol]);

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
      !isLogin
    );
  }, [
    fromNetworkSelected?.network,
    fromTokenSymbol,
    isLogin,
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
  const renderDepositMainContent = useMemo(() => {
    return (
      <div
        className={clsx(
          'main-content-container',
          'main-content-container-safe-area',
          styles['main-content'],
        )}>
        <div className={styles['deposit-title']}>Deposit Assets</div>

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

        <div className={clsx('row-center', styles['arrow-right'])}>
          <DoubleArrowIcon />
        </div>

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
              isShowLoading={isShowNetworkLoading}
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
                {isLogin ? (
                  <>
                    <div className={styles['circle']} />
                    <span className={styles['connected']}>Connected</span>
                  </>
                ) : (
                  <span className={styles['connect']} onClick={handleLogin}>
                    Connect
                  </span>
                )}
              </div>
            </div>

            <SelectChainWrapper
              className={styles['selected-chain']}
              menuItems={menuItems}
              selectedItem={toChainItem}
              mobileTitle={`Deposit ${'To'}`}
              chainChanged={toChainChanged}
            />
          </div>
        </div>

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
              />
            </>
          )}

        {fromTokenSymbol !== toTokenSymbol && (
          <>
            <Space direction="vertical" size={24} />
            <Calculator />
          </>
        )}

        <Space direction="vertical" size={40} />

        {isShowTransferTip && (
          <>
            <div className={clsx(styles['label'], styles['label-deposit-address'])}>Transfer</div>
            <TransferTip
              toChainItem={toChainItem}
              symbol={fromTokenSymbol}
              network={fromNetworkSelected}
            />
            <Space direction="vertical" size={24} />
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
            {isLogin && showRetry && <DepositRetryForWeb isShowImage={true} onClick={onRetry} />}
            {isLogin && !showRetry && !!depositInfo.depositAddress && (
              <>
                <Space direction="vertical" size={4} />
                <DepositTip fromToken={fromTokenSymbol} toToken={toTokenSymbol} />
                <Space direction="vertical" size={12} />
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
                  <CommonAddress
                    label={DEPOSIT_ADDRESS_LABEL}
                    value={depositInfo.depositAddress}
                    copySize={CopySize.Big}
                  />
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
        )}
      </div>
    );
  }, [
    contractAddress,
    contractAddressLink,
    depositInfo.depositAddress,
    depositInfo.minAmount,
    depositInfo.minAmountUsd,
    fromNetworkChanged,
    fromNetworkSelected,
    fromTokenChanged,
    fromTokenList,
    fromTokenSelected,
    fromTokenSymbol,
    handleLogin,
    isLogin,
    isShowDepositAddressLabelForLogin,
    isShowDepositAddressLabelForNotLogin,
    isShowNetworkLoading,
    isShowNotLoginTip,
    isShowTransferTip,
    menuItems,
    newFromNetworkList,
    onRetry,
    qrCodeValue,
    renderDepositDescription,
    showRetry,
    toChainChanged,
    toChainItem,
    toTokenList,
    toTokenSelectCallback,
    toTokenSelected,
    toTokenSymbol,
    tokenLogoUrl,
  ]);

  return (
    <div className="content-container flex-row">
      <div className={styles['main-container']}>
        <div className={styles['main-wrapper']}>{renderDepositMainContent}</div>
      </div>
      <div className={clsx('flex-row', styles['faq-wrapper'])}>
        <div className={styles['faq-left']}></div>
        <FAQ className={styles['faq']} title={FAQ_DEPOSIT.title} list={FAQ_DEPOSIT.list} />
      </div>
    </div>
  );
}
