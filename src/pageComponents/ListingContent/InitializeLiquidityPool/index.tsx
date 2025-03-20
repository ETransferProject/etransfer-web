import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import NetworkLogo from 'components/NetworkLogo';
import { formatSymbolDisplay, formatWithCommas } from 'utils/format';
import Copy from 'components/Copy';
import CommonQRCode from 'components/CommonQRCode';
import CommonButton, { CommonButtonSize } from 'components/CommonButton';
import { CheckFilled16 } from 'assets/images';
import clsx from 'clsx';
import { viewTokenAddressInExplore } from 'utils/common';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { changeApplicationStatus, getApplicationDetail } from 'utils/api/application';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffectOnce } from 'react-use';
import { ApplicationChainStatusEnum, TApplicationDetailItemChainTokenInfo } from 'types/api';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import myEvents from 'utils/myEvent';
import { useSetAelfAuthFromStorage } from 'hooks/wallet/aelfAuthToken';
import { sleep, ZERO } from '@etransfer/utils';
import { useCommonState, useLoading } from 'store/Provider/hooks';
import useAelf, { useAelfLogin, useShowLoginButtonLoading } from 'hooks/wallet/useAelf';
import { CONNECT_AELF_WALLET } from 'constants/wallet';
import EmptyDataBox from 'components/EmptyDataBox';
import {
  LISTING_STEP_PATHNAME_MAP,
  ListingStep,
  SERVICE_BUSY_TIP,
  WALLET_CONNECTION_REQUIRED,
} from 'constants/listing';
import PartialLoading from 'components/PartialLoading';
import CommonSpace from 'components/CommonSpace';
import { BUTTON_TEXT_SUBMIT } from 'constants/misc';
import CommonTip from '../../../components/CommonTip';
import DisplayImage from 'components/DisplayImage';
import { SingleMessage } from '@etransfer/ui-react';

export interface InitializeLiquidityPoolProps {
  id?: string;
  symbol?: string;
  onNext?: () => void;
}

const AlreadyPoolInitializedStatus = [
  ApplicationChainStatusEnum.Complete,
  ApplicationChainStatusEnum.Failed,
  ApplicationChainStatusEnum.Integrating,
  ApplicationChainStatusEnum.PoolInitialized,
];

const ToolPoolInitCompleted = 'Token pool initialization completed';

export default function InitializeLiquidityPool({
  id,
  symbol,
  onNext,
}: InitializeLiquidityPoolProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeQuery = useMemo(
    () => ({
      id: searchParams.get('id'),
      tokenSymbol: searchParams.get('symbol'),
    }),
    [searchParams],
  );
  const { isPadPX, isMobilePX } = useCommonState();
  const { setLoading } = useLoading();
  const { isConnected } = useAelf();
  const handleAelfLogin = useAelfLogin();
  const setAelfAuthFromStorage = useSetAelfAuthFromStorage();
  // Fix: It takes too long to obtain NightElf walletInfo, and the user mistakenly clicks the login button during this period.
  const isLoginButtonLoading = useShowLoginButtonLoading();
  const currentSymbol = useMemo(
    () => routeQuery.tokenSymbol || symbol || '',
    [routeQuery.tokenSymbol, symbol],
  );
  const currentId = useMemo(() => routeQuery.id || id || '', [routeQuery.id, id]);
  const [tokenInfo, setTokenInfo] = useState({ symbol: '', limit24HInUsd: '', icon: '' });
  const [tokenPoolList, setTokenPoolList] = useState<TApplicationDetailItemChainTokenInfo[]>([]);
  const [submitDisabled, setSubmitDisable] = useState(true);

  const tipNode = useMemo(() => {
    return tokenInfo.symbol && tokenInfo.limit24HInUsd ? (
      <CommonTip
        title="Transfer limits"
        tip={
          <>
            <div className={isPadPX ? styles['tip-row-pad'] : styles['tip-row-web']}>
              {`1. The 24-hour transfer limit for the ${formatSymbolDisplay(
                tokenInfo.symbol,
              )} is $${formatWithCommas({ amount: tokenInfo.limit24HInUsd })}.`}
            </div>
            <div
              className={
                isPadPX ? styles['tip-row-pad'] : styles['tip-row-web']
              }>{`2. Adding liquidity may take a few minutes for network confirmation.`}</div>
          </>
        }
      />
    ) : null;
  }, [isPadPX, tokenInfo.limit24HInUsd, tokenInfo.symbol]);

  const handleGoExplore = useCallback(
    (network: string, symbol: string, chainId?: string, address?: string) => {
      viewTokenAddressInExplore(network, symbol, chainId as TChainId, address);
    },
    [],
  );

  const checkIsInitCompleted = useCallback(
    (status: ApplicationChainStatusEnum, balanceAmount: string, minAmount: string) => {
      if (!balanceAmount || !minAmount) return false;
      if (
        ZERO.plus(balanceAmount).gte(minAmount) ||
        AlreadyPoolInitializedStatus.includes(status)
      ) {
        return true;
      }
      return false;
    },
    [],
  );

  const formatBalanceAmount = useCallback((amount: string) => {
    return formatWithCommas({ amount: parseFloat(Number(amount).toFixed(6)) });
  }, []);

  const renderList = useMemo(() => {
    return (
      <div>
        {tokenPoolList.map((item, index) => {
          return (
            <div
              key={'initialize-liquidity-pool-list-' + index}
              className={styles['initialize-liquidity-pool-item']}>
              <div className={isMobilePX ? 'flex-column gap-8' : 'flex-row-center-between gap-8'}>
                <div className="flex-row-center gap-8">
                  <NetworkLogo network={item.chainId} />
                  <span className={styles['network-name']}>{item.chainName}</span>
                </div>
                {checkIsInitCompleted(item.status, item.balanceAmount, item.minAmount) ? (
                  <div className={'flex-row-center gap-8'}>
                    <CheckFilled16 />
                    <span>{ToolPoolInitCompleted}</span>
                  </div>
                ) : (
                  <div className={clsx('flex-row-center', styles['amount-rate'])}>
                    <PartialLoading />
                    <CommonSpace direction="horizontal" size={8} />
                    <span>Received&nbsp;</span>
                    <span className={styles['balance-amount']}>
                      {item.balanceAmount
                        ? formatBalanceAmount(item.balanceAmount)
                        : DEFAULT_NULL_VALUE}
                      {!isMobilePX && <>&nbsp;{formatSymbolDisplay(item.symbol)}</>}
                    </span>
                    <span>/</span>
                    <span>
                      {item.minAmount
                        ? formatWithCommas({ amount: item.minAmount })
                        : DEFAULT_NULL_VALUE}
                      &nbsp;
                    </span>
                    <span className={styles['symbol']}>{formatSymbolDisplay(item.symbol)}</span>
                  </div>
                )}
              </div>
              {item.poolAddress && (
                <div className={styles['address-info']}>
                  <CommonQRCode size={120} value={item.poolAddress} logoUrl={item.icon} />
                  <div>
                    <div className={styles['address-desc']}>
                      <span>Please transfer&nbsp;</span>
                      <span
                        className={styles['action-bold']}
                        onClick={() =>
                          handleGoExplore(
                            item.chainId,
                            item.symbol,
                            item.chainId,
                            item.tokenContractAddress,
                          )
                        }>
                        {formatSymbolDisplay(item.symbol)}
                      </span>
                      <span>&nbsp;on the&nbsp;</span>
                      <span>{item.chainName}</span>
                      <span>&nbsp;to the following address to complete fund initialization.</span>
                    </div>
                    <div className="flex-row-center gap-8">
                      <div className={styles['address']}>{item.poolAddress}</div>
                      <Copy toCopy={item.poolAddress} className="flex-shrink-0" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [checkIsInitCompleted, formatBalanceAmount, handleGoExplore, isMobilePX, tokenPoolList]);

  const getData = useCallback(
    async (id: string, symbol: string, isLoading = true) => {
      if (!isConnected) return;
      try {
        isLoading && setLoading(true);

        await setAelfAuthFromStorage();
        await sleep(500);
        const res = await getApplicationDetail({ symbol, id });

        const chainTokenInfos = res[0]?.chainTokenInfo || [];
        const otherChainTokenInfos = res[0]?.otherChainTokenInfo;
        let concatList = [];
        if (otherChainTokenInfos) {
          concatList = chainTokenInfos?.concat([otherChainTokenInfos]);
        } else {
          concatList = chainTokenInfos;
        }

        if (concatList.length === 0) {
          router.push('/my-applications');
          return;
        }

        setTokenPoolList(concatList);
        setTokenInfo({
          symbol: res[0].symbol,
          icon: concatList[0].icon,
          limit24HInUsd:
            otherChainTokenInfos?.limit24HInUsd || chainTokenInfos[0]?.limit24HInUsd || '0.00',
        });

        // submit but disable
        const unfinishedAelfTokenPool = concatList?.find(
          (item) => item.balanceAmount < item.minAmount,
        );
        if (unfinishedAelfTokenPool?.chainId) {
          setSubmitDisable(true);
        } else {
          setSubmitDisable(false);
        }
      } catch (error) {
        console.log('InitializeLiquidityPool getData error', error);
      } finally {
        setLoading(false);
      }
    },
    [isConnected, router, setAelfAuthFromStorage, setLoading],
  );

  const init = useCallback(
    async (isLoading = true) => {
      if (currentId && currentSymbol) {
        await getData(currentId, currentSymbol, isLoading);
      } else {
        if (currentSymbol) {
          router.replace(
            `/listing/${
              LISTING_STEP_PATHNAME_MAP[ListingStep.TOKEN_INFORMATION]
            }?symbol=${currentSymbol}`,
          );
        } else {
          router.replace(`/listing/${LISTING_STEP_PATHNAME_MAP[ListingStep.TOKEN_INFORMATION]}`);
        }
      }
    },
    [currentId, currentSymbol, getData, router],
  );
  const initRef = useRef(init);
  initRef.current = init;

  const connectAndInit = useCallback(() => {
    if (!isConnected) {
      handleAelfLogin(true, initRef.current, true);
    } else {
      initRef.current();
    }
  }, [handleAelfLogin, isConnected]);
  const connectAndInitRef = useRef(connectAndInit);
  connectAndInitRef.current = connectAndInit;
  const connectAndInitSleep = useCallback(async () => {
    setLoading(true);
    // Delay 3s to determine the login status, because the login data is acquired slowly, to prevent the login pop-up window from being displayed first and then automatically logging in successfully later.
    await sleep(3000);
    connectAndInitRef.current();
  }, [setLoading]);
  useEffectOnce(() => {
    connectAndInitSleep();
  });

  const updateDataTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (updateDataTimerRef.current) {
      clearInterval(updateDataTimerRef.current);
    }
    updateDataTimerRef.current = setInterval(async () => {
      await initRef.current(false);
    }, 15 * 1000);

    return () => {
      if (updateDataTimerRef.current) {
        clearInterval(updateDataTimerRef.current);
      }
    };
  }, []);

  const initForLogout = useCallback(async () => {
    if (updateDataTimerRef.current) {
      clearInterval(updateDataTimerRef.current);
    }
    setTokenPoolList([]);
    setTokenInfo({ symbol: '', limit24HInUsd: '', icon: '' });
    setSubmitDisable(true);
  }, []);
  const initLogoutRef = useRef(initForLogout);
  initLogoutRef.current = initForLogout;

  const initForReLogin = useCallback(async () => {
    initRef.current();
  }, []);
  const initForReLoginRef = useRef(initForReLogin);
  initForReLoginRef.current = initForReLogin;

  useEffectOnce(() => {
    // log in
    const { remove: removeLoginSuccess } = myEvents.LoginSuccess.addListener(() =>
      initForReLoginRef.current(),
    );
    // log out \ exit
    const { remove: removeLogoutSuccess } = myEvents.LogoutSuccess.addListener(() => {
      initLogoutRef.current();
    });

    return () => {
      removeLoginSuccess();
      removeLogoutSuccess();
    };
  });

  const onSubmit = useCallback(async () => {
    try {
      const res = await changeApplicationStatus({ symbol: currentSymbol, id: currentId });
      if (res) {
        onNext?.();
      } else {
        SingleMessage.error(SERVICE_BUSY_TIP);
      }
    } catch (error) {
      SingleMessage.error(SERVICE_BUSY_TIP);
    }
  }, [currentId, currentSymbol, onNext]);

  return (
    <div className={styles['initialize-liquidity-pool']}>
      <div className={styles['component-title-wrapper']}>
        <div className={styles['component-title']}>
          <span>Initialize</span>
          {tokenInfo.symbol && (
            <>
              <CommonSpace className="flex-shrink-0" direction={'horizontal'} size={4} />
              <DisplayImage name={formatSymbolDisplay(tokenInfo.symbol)} src={tokenInfo.icon} />
              <CommonSpace className="flex-shrink-0" direction={'horizontal'} size={4} />
              <span className={styles['component-title-symbol']}>
                {formatSymbolDisplay(tokenInfo.symbol)}
              </span>
            </>
          )}
          <span className="flex-shrink-0">&nbsp;token pool</span>
        </div>
        {tipNode}
      </div>
      {isConnected ? (
        <>
          {renderList}
          <CommonButton
            className={styles['submit-button']}
            onClick={onSubmit}
            size={CommonButtonSize.Small}
            disabled={submitDisabled}>
            {BUTTON_TEXT_SUBMIT}
          </CommonButton>
        </>
      ) : (
        <>
          <EmptyDataBox emptyText={WALLET_CONNECTION_REQUIRED} />
          <CommonButton
            className={styles['submit-button']}
            onClick={() => handleAelfLogin(true)}
            loading={isLoginButtonLoading}
            size={CommonButtonSize.Small}>
            {CONNECT_AELF_WALLET}
          </CommonButton>
        </>
      )}
    </div>
  );
}
