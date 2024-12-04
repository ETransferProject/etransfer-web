import { BackIcon } from 'assets/images';
import styles from './styles.module.scss';
import MyApplicationTable from './MyApplicationTable';
import { useCommonState } from 'store/Provider/hooks';
import MyApplicationList from './MyApplicationList';
import { useDebounceCallback } from 'hooks/debounce';
import { useCallback, useState } from 'react';
import { useEffectOnce } from 'react-use';

const mockData = [
  {
    symbol: 'SGR-1',
    icon: '',
    name: 'SGR-1',
    network: 'AELF',
    networkName: 'aelf MainChain',
    status: 'Processing',
    coboReviewStatus: 'Reviewing',
  },
  {
    symbol: 'SGR-1',
    icon: '',
    name: 'SGR-1',
    network: 'AELF',
    networkName: 'aelf MainChain',
    status: 'Processing',
    coboReviewStatus: 'Reviewed',
  },
  {
    symbol: 'USDT',
    icon: '',
    name: 'USDT USDT',
    network: 'tDVW',
    networkName: 'aelf dAppChain',
    status: 'Succeed',
  },
  {
    symbol: 'ELF',
    icon: '',
    name: 'ELF',
    network: 'TRX',
    networkName: 'TRX TRX',
    status: 'Failed',
    failReason: '234',
  },
  {
    symbol: 'ELFELFELFELFELFELFELFELFELFELFELFELFELFELFELFELFELF',
    icon: '',
    name: 'ELF',
    network: 'TRX',
    networkName: 'TRX TRX',
    status: 'Failed',
    failReason: '234',
  },
];

export default function MyApplicationsPage() {
  const { isPadPX, isMobilePX } = useCommonState();
  const [applicationList, setApplicationList] = useState<any[]>([]);

  // pagination
  const [skipPageCount, setSkipPageCount] = useState(0);
  const [maxResultCount, setMaxResultCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const getApplicationData = useCallback(async ({ skip, max }: { skip?: number; max?: number }) => {
    // TODO
    console.log(skip, max);
    setApplicationList(mockData);
    setTotalCount(20);
  }, []);

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
    if (applicationList.length < totalCount) {
      setSkipPageCount(skipPageCount + 1);
      await getApplicationData({
        skip: skipPageCount + 1,
      });
    }
  }, [applicationList.length, getApplicationData, skipPageCount, totalCount]);

  const init = useCallback(async () => {
    getApplicationData({});
  }, [getApplicationData]);

  useEffectOnce(() => {
    init();
  });

  return (
    <div className={styles['page-container-wrapper']}>
      {!isPadPX && (
        <div className={styles['page-back']}>
          <BackIcon />
          <div className={styles['page-back-text']}>Back</div>
        </div>
      )}

      <div className={styles['page-body']}>
        {isMobilePX ? (
          <MyApplicationList
            totalCount={totalCount}
            applicationList={applicationList}
            onNextPage={handleNextPage}
          />
        ) : (
          <>
            <div className={styles['page-title']}>My Applications</div>
            <MyApplicationTable
              totalCount={totalCount}
              applicationList={applicationList}
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
