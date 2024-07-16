import clsx from 'clsx';
import ECharts from 'components/ECharts';
import { EChartsOption } from 'echarts';
import { useCallback, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import BarChartHeader from '../components/BarChartHeader';
import { generateStackBarOption } from '../components/utils';
import { eChartsElementEvent } from 'components/ECharts/Charts';
import { useDebounceCallback } from 'hooks/debounce';
import Space from 'components/Space';
import { OverviewLegendList } from 'constants/infoDashboard';
import { getTransactionOverview } from 'utils/api/infoDashboard';
import { useEffectOnce } from 'react-use';
import { TTransactionOverviewItem, TOverviewTimeType } from 'types/api';
import { computePlus } from '../utils';

type TCurrentItem = {
  date: string;
  deposit: string;
  withdraw: string;
  plus: string;
};

type TTotalItem = {
  date: string;
  plus: string;
};

export default function TransactionOverview() {
  const dataMapRef = useRef<Record<string, Partial<TTransactionOverviewItem>>>({});
  const [opacity, setOpacity] = useState(1);
  const [chartData, setChartData] = useState<TTransactionOverviewItem[]>([]);
  const [totalItem, setTotalItem] = useState<TTotalItem>();
  const [currentItem, setCurrentItem] = useState<TCurrentItem>();
  const [loading, setLoading] = useState(true);

  const option = useMemo<EChartsOption>(() => {
    return generateStackBarOption({
      data: chartData,
      depositKey: 'depositTx',
      withdrawKey: 'withdrawTx',
      stackName: 'transaction',
      opacity: opacity,
      emphasisOpacity: 1,
    });
  }, [chartData, opacity]);

  const mouseoverCallback = useCallback((event: eChartsElementEvent) => {
    setOpacity(0.2);
    const dataItem = dataMapRef.current?.[event?.name] || {};
    setCurrentItem({
      deposit: String(dataItem.depositTx) || '',
      withdraw: String(dataItem.withdrawTx) || '',
      plus: computePlus(dataItem.depositTx, dataItem.withdrawTx),
      date: event?.name,
    });
  }, []);

  // const mouseoutCallback = useCallback((event: eChartsElementEvent) => {
  //   console.log('>>> mouseoutCallback', event);

  //   // setOpacity(0.6);
  // }, []);

  const globaloutCallback = useDebounceCallback(
    () => {
      setOpacity(1);

      setCurrentItem({
        deposit: '',
        withdraw: '',
        plus: totalItem?.plus || '',
        date: totalItem?.date || '',
      });
    },
    [],
    100,
  );

  const getData = useCallback(async (time: TOverviewTimeType) => {
    try {
      setLoading(true);
      const res = await getTransactionOverview({
        type: time,
      });

      let list: TTransactionOverviewItem[] = [];

      switch (time) {
        case TOverviewTimeType.Day:
          if (res.transaction?.day) {
            list = res.transaction.day;
          }

          break;
        case TOverviewTimeType.Week:
          if (res.transaction?.week) {
            list = res.transaction.week;
          }
          break;
        case TOverviewTimeType.Month:
          if (res.transaction?.month) {
            list = res.transaction.month;
          }
          break;

        default:
          break;
      }

      dataMapRef.current = Object.fromEntries(list.map((item) => [item.date, item]));

      setChartData(list);
      setTotalItem({
        plus: String(res.transaction.totalTx),
        date: res.transaction.latest,
      });
      setCurrentItem({
        deposit: '',
        withdraw: '',
        plus: String(res.transaction.totalTx),
        date: res.transaction.latest,
      });
    } catch (error) {
      console.log('TransactionOverview get data error', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSwitchPeriod = useCallback(
    (time: TOverviewTimeType) => {
      getData(time);
    },
    [getData],
  );

  useEffectOnce(() => {
    getData(TOverviewTimeType.Day);
  });

  return (
    <div className={clsx('flex-1', styles['transaction-charts-container'])}>
      <BarChartHeader
        legendList={OverviewLegendList}
        title="Transaction"
        plusCount={currentItem?.plus || ''}
        countUnit=" Txs"
        depositCount={currentItem?.deposit}
        withdrawCount={currentItem?.withdraw}
        time={currentItem?.date || ''}
        switchPeriod={onSwitchPeriod}
      />
      <Space direction={'vertical'} size={16} />
      <ECharts
        loading={loading}
        className={clsx(styles['transaction-charts'])}
        option={option}
        mouseoverCallback={mouseoverCallback}
        // mouseoutCallback={mouseoutCallback}
        globaloutCallback={globaloutCallback}
      />
    </div>
  );
}
