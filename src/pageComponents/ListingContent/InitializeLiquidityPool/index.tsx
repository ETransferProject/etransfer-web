import Remind from 'components/Remind';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import NetworkLogo from 'components/NetworkLogo';
import { formatSymbolDisplay } from 'utils/format';
import Copy from 'components/Copy';
import CommonQRCode from 'components/CommonQRCode';
import CommonButton, { CommonButtonSize } from 'components/CommonButton';
import { CheckFilled16 } from 'assets/images';
import clsx from 'clsx';
import { openWithBlank, viewTokenAddressInExplore } from 'utils/common';
import { CONTACT_US_FORM_URL } from 'constants/index';
import { getApplicationDetail } from 'utils/api/application';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffectOnce } from 'react-use';
import { ApplicationChainStatusEnum, TApplicationDetailItemChainTokenInfo } from 'types/api';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import myEvents from 'utils/myEvent';
import { useSetAelfAuthFromStorage } from 'hooks/wallet/aelfAuthToken';
import { sleep, ZERO } from '@etransfer/utils';
import { useLoading } from 'store/Provider/hooks';
import useAelf, { useAelfLogin, useShowLoginButtonLoading } from 'hooks/wallet/useAelf';
import { CONNECT_AELF_WALLET } from 'constants/wallet';
import EmptyDataBox from 'components/EmptyDataBox';
import {
  LISTING_STEP_PATHNAME_MAP,
  ListingStep,
  WALLET_CONNECTION_REQUIRED,
} from 'constants/listing';
import PartialLoading from 'components/PartialLoading';
import CommonSpace from 'components/CommonSpace';
import { BUTTON_TEXT_NEXT } from 'constants/misc';

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

export default function InitializeLiquidityPool({
  id,
  symbol,
  onNext,
}: InitializeLiquidityPoolProps) {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { isConnected } = useAelf();
  const handleAelfLogin = useAelfLogin();
  const setAelfAuthFromStorage = useSetAelfAuthFromStorage();
  // Fix: It takes too long to obtain NightElf walletInfo, and the user mistakenly clicks the login button during this period.
  const isLoginButtonLoading = useShowLoginButtonLoading();
  const [tokenInfo, setTokenInfo] = useState({ symbol: '', limit24HInUsd: '' });
  const [tokenPoolList, setTokenPoolList] = useState<TApplicationDetailItemChainTokenInfo[]>([]);
  const [submitDisabled, setSubmitDisable] = useState(true);

  const renderRemind = useMemo(() => {
    return (
      <Remind className={styles['remind']} iconClassName={styles['remind-icon']} isBorder={false}>
        <div>
          <div className={styles['tip-row']}>
            {`• Please transfer the ${formatSymbolDisplay(
              tokenInfo.symbol,
            )} for each chain into the liquidity pool.`}
          </div>
          <div className={styles['tip-row']}>• Transferring other tokens will be invalid.</div>
          <div className={styles['tip-row']}>
            {`• The 24-hour transfer limit for the ${formatSymbolDisplay(tokenInfo.symbol)} is $${
              tokenInfo.limit24HInUsd
            }.`}
          </div>
          <div className={styles['tip-row']}>
            {`If you need any support, please `}
            <span
              className={styles['action']}
              onClick={() => openWithBlank(CONTACT_US_FORM_URL)}>{`contact us`}</span>
            {`.`}
          </div>
        </div>
      </Remind>
    );
  }, [tokenInfo.limit24HInUsd, tokenInfo.symbol]);

  const handleGoExplore = useCallback((network: string, symbol?: string, address?: string) => {
    viewTokenAddressInExplore(network, symbol as TChainId, address);
  }, []);

  const checkIsInitCompleted = useCallback(
    (status: ApplicationChainStatusEnum, balanceAmount: string, minAmount: string) => {
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

  const renderList = useMemo(() => {
    return (
      <div>
        {tokenPoolList.map((item, index) => {
          return (
            <div
              key={'initialize-liquidity-pool-list-' + index}
              className={styles['initialize-liquidity-pool-item']}>
              <div className="flex-row-center-between">
                <div className="flex-row-center gap-8">
                  <NetworkLogo network={item.chainId} />
                  <span className={styles['network-name']}>{item.chainName}</span>
                </div>
                {checkIsInitCompleted(item.status, item.balanceAmount, item.minAmount) ? (
                  <div className={'flex-row-center gap-8'}>
                    <CheckFilled16 />
                    <span>Token pool initialization completed</span>
                  </div>
                ) : (
                  <div className={clsx('flex-row-center', styles['amount-rate'])}>
                    <PartialLoading />
                    <CommonSpace direction="horizontal" size={8} />
                    <span>Received&nbsp;</span>
                    <span className={styles['balance-amount']}>
                      {item.balanceAmount}&nbsp;{formatSymbolDisplay(item.symbol)}
                    </span>
                    <span>
                      /{item.minAmount}&nbsp;{formatSymbolDisplay(item.symbol)}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles['address-info']}>
                <CommonQRCode size={120} value={item.poolAddress} logoUrl={item.icon} />
                <div>
                  <div className={styles['address-desc']}>
                    <span>Please transfer&nbsp;</span>
                    <span
                      className={styles['action-bold']}
                      onClick={() =>
                        handleGoExplore(item.chainId, item.symbol, item.contractAddress)
                      }>
                      {formatSymbolDisplay(item.symbol)}
                    </span>
                    <span>&nbsp;on the&nbsp;</span>
                    <span>{item.chainName}</span>
                    <span>to the following address to complete fund initialization.</span>
                  </div>
                  <div className="flex-row-center gap-8">
                    <div className={styles['address']}>{item.poolAddress}</div>
                    <Copy toCopy={item.poolAddress} className="flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [checkIsInitCompleted, handleGoExplore, tokenPoolList]);

  const getData = useCallback(
    async (id: string, symbol: string) => {
      if (!isConnected) return;
      try {
        setLoading(true);

        await setAelfAuthFromStorage();
        await sleep(500);
        const res = await getApplicationDetail({ symbol, id });

        const chainTokenInfos = res.items[0].chainTokenInfo;
        const otherChainTokenInfos = res.items[0].otherChainTokenInfo;
        const concatList = chainTokenInfos.concat([otherChainTokenInfos]);
        setTokenPoolList(concatList);
        setTokenInfo({
          symbol: res.items[0].symbol,
          limit24HInUsd: otherChainTokenInfos.limit24HInUsd || chainTokenInfos[0].limit24HInUsd,
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
    [isConnected, setAelfAuthFromStorage, setLoading],
  );

  const searchParams = useSearchParams();
  const routeQuery = useMemo(
    () => ({
      id: searchParams.get('id'),
      tokenSymbol: searchParams.get('symbol'),
    }),
    [searchParams],
  );

  const init = useCallback(async () => {
    if (routeQuery.id && routeQuery.tokenSymbol) {
      await getData(routeQuery.id, routeQuery.tokenSymbol);
    } else if (id && symbol) {
      await getData(id, symbol);
    } else {
      if (routeQuery.tokenSymbol || symbol) {
        router.replace(
          `/listing/${LISTING_STEP_PATHNAME_MAP[ListingStep.TOKEN_INFORMATION]}?symbol=${
            routeQuery.tokenSymbol || symbol
          }`,
        );
      } else {
        router.replace(`/listing/${LISTING_STEP_PATHNAME_MAP[ListingStep.TOKEN_INFORMATION]}`);
      }
    }
  }, [getData, id, routeQuery.id, routeQuery.tokenSymbol, router, symbol]);
  const initRef = useRef(init);
  initRef.current = init;

  useEffectOnce(() => {
    if (!isConnected) {
      handleAelfLogin(true, init);
    } else {
      init();
    }
  });

  const updateDataTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (updateDataTimerRef.current) {
      clearInterval(updateDataTimerRef.current);
    }
    updateDataTimerRef.current = setInterval(async () => {
      await init();
    }, 15 * 1000);

    return () => {
      if (updateDataTimerRef.current) {
        clearInterval(updateDataTimerRef.current);
      }
    };
  }, [checkIsInitCompleted, init]);

  const initForLogout = useCallback(async () => {
    if (updateDataTimerRef.current) {
      clearInterval(updateDataTimerRef.current);
    }
    setTokenPoolList([]);
    setTokenInfo({ symbol: '', limit24HInUsd: '' });
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

  return (
    <div className={styles['initialize-liquidity-pool']}>
      {isConnected ? (
        <>
          {renderRemind}
          {renderList}
          <CommonButton
            className={styles['submit-button']}
            onClick={onNext}
            size={CommonButtonSize.Small}
            disabled={submitDisabled}>
            {BUTTON_TEXT_NEXT}
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
