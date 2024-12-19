import { BackIcon } from 'assets/images';
import styles from './styles.module.scss';
import MyApplicationTable from './MyApplicationTable';
import { useCommonState, useLoading } from 'store/Provider/hooks';
import MyApplicationList from './MyApplicationList';
import { useDebounceCallback } from 'hooks/debounce';
import { useCallback, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { getMyApplicationList } from 'utils/api/application';
import LinkForBlank from 'components/LinkForBlank';
import clsx from 'clsx';
import myEvents from 'utils/myEvent';
import { BUTTON_TEXT_BACK } from 'constants/misc';
import useAelf, { useAelfLogin, useInitAelfWallet } from 'hooks/wallet/useAelf';
import { sleep } from '@etransfer/utils';
import { useSetAelfAuthFromStorage } from 'hooks/wallet/aelfAuthToken';

export default function MyApplicationsPage() {
  const { isPadPX, isMobilePX } = useCommonState();
  const { setLoading } = useLoading();
  const { isConnected } = useAelf();
  const handleAelfLogin = useAelfLogin();
  const setAelfAuthFromStorage = useSetAelfAuthFromStorage();
  useInitAelfWallet();
  const [currentApplicationList, setCurrentApplicationList] = useState<any[]>([]);
  const [totalApplicationList, setTotalApplicationList] = useState<any[]>([]);

  // pagination
  const [skipPageCount, setSkipPageCount] = useState(0);
  const [maxResultCount, setMaxResultCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const getApplicationData = useCallback(
    async ({ skip, max }: { skip?: number; max?: number }) => {
      console.log(skip, max);
      try {
        setLoading(true);
        await setAelfAuthFromStorage();
        await sleep(500);
        const currentSkipPageCount = typeof skip !== 'number' ? skipPageCount : skip;
        const currentMaxCount = typeof max !== 'number' ? maxResultCount : max;
        const currentSkipCount = currentSkipPageCount * currentMaxCount;
        const res = await getMyApplicationList({
          skipCount: currentSkipCount,
          maxResultCount: currentMaxCount,
        });

        setCurrentApplicationList(res.items);

        let _totalList = [];
        if (currentSkipCount === 0) {
          _totalList = res.items;
        } else {
          _totalList = [...totalApplicationList, ...res.items];
        }
        setTotalApplicationList(_totalList);

        setTotalCount(res.totalCount);
      } catch (error) {
        console.log('>>>>>> getApplicationData error', error);
      } finally {
        setLoading(false);
      }
    },
    [maxResultCount, setAelfAuthFromStorage, setLoading, skipPageCount, totalApplicationList],
  );

  // web get page date
  const tableOnChange = useCallback(
    (page: number, pageSize: number) => {
      let skip = skipPageCount;
      let max = maxResultCount;
      const newPage = page - 1;
      if (newPage !== skipPageCount) {
        skip = newPage;
        setSkipPageCount(newPage);
      }
      if (maxResultCount !== pageSize) {
        // pageSize change and skipCount need init
        skip = 0;
        max = pageSize;
        setSkipPageCount(0);
        setMaxResultCount(pageSize);
      }

      getApplicationData({
        skip,
        max,
      });
    },
    [getApplicationData, maxResultCount, skipPageCount],
  );

  // mobile get next page
  const handleNextPage = useDebounceCallback(async () => {
    if (totalApplicationList.length < totalCount) {
      setSkipPageCount(skipPageCount + 1);
      await getApplicationData({
        skip: skipPageCount + 1,
      });
    }
  }, [getApplicationData, skipPageCount, totalApplicationList.length, totalCount]);

  const init = useCallback(async () => {
    getApplicationData({});
  }, [getApplicationData]);

  const connectAndInit = useCallback(() => {
    if (!isConnected) {
      handleAelfLogin(true, init);
    } else {
      init();
    }
  }, [handleAelfLogin, init, isConnected]);
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

  const initForLogout = useCallback(async () => {
    setCurrentApplicationList([]);
    setTotalApplicationList([]);
    setSkipPageCount(0);
    setMaxResultCount(10);
    setTotalCount(0);
  }, []);
  const initLogoutRef = useRef(initForLogout);
  initLogoutRef.current = initForLogout;

  const initForReLogin = useCallback(async () => {
    getApplicationData({ skip: 0, max: 10 });
  }, [getApplicationData]);
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
    <div className={styles['my-applications-page-container-wrapper']}>
      {!isPadPX && (
        <LinkForBlank
          className={styles['my-applications-page-back']}
          href="/"
          element={
            <>
              <BackIcon />
              <div className={styles['my-applications-page-back-text']}>{BUTTON_TEXT_BACK}</div>
            </>
          }
        />
      )}

      <div
        className={clsx(
          styles['my-applications-page-body'],
          totalApplicationList.length === 0 && styles['my-applications-page-body-white'],
        )}>
        {isMobilePX ? (
          <MyApplicationList
            totalCount={totalCount}
            applicationList={totalApplicationList}
            onNextPage={handleNextPage}
          />
        ) : (
          <>
            <div className={styles['my-applications-page-title']}>My Applications</div>
            <MyApplicationTable
              totalCount={totalCount}
              applicationList={currentApplicationList}
              tableOnChange={tableOnChange}
              maxResultCount={maxResultCount}
              skipPageCount={skipPageCount}
            />
          </>
        )}
      </div>
    </div>
  );
}
