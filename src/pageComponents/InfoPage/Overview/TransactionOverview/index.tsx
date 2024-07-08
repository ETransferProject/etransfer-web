import clsx from 'clsx';
import ECharts from 'components/ECharts';
import { EChartsOption } from 'echarts';
import { useCallback, useMemo, useState } from 'react';
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

export default function TransactionOverview() {
  const [opacity, setOpacity] = useState(1);
  const [chartData, setChartData] = useState<TTransactionOverviewItem[]>([]);

  const option = useMemo<EChartsOption>(() => {
    return generateStackBarOption({
      data: [
        { date: '01', depositTx: 100, withdrawTx: 150 },
        { date: '02', depositTx: 10, withdrawTx: 50 },
      ],
      stackName: 'transaction',
      opacity: opacity,
      emphasisOpacity: 1,
    });
  }, [opacity]);

  const mouseoverCallback = useDebounceCallback(
    (event: eChartsElementEvent) => {
      console.log('>>> mouseoverCallback', event);
      setOpacity(0.6);
    },
    [],
    100,
  );

  const mouseoutCallback = useDebounceCallback(
    (event: eChartsElementEvent) => {
      console.log('>>> mouseoutCallback', event);
      setOpacity(0.6);
    },
    [],
    100,
  );
  const globaloutCallback = useDebounceCallback(
    (event: eChartsElementEvent) => {
      console.log('>>> globaloutCallback', event);
      setOpacity(1);
    },
    [],
    100,
  );

  const getData = useCallback(async (time: TOverviewTimeType) => {
    const res = await getTransactionOverview({
      type: time,
    });

    switch (time) {
      case TOverviewTimeType.Day:
        if (res.transaction?.day) {
          setChartData(res.transaction.day);
        }

        break;
      case TOverviewTimeType.Week:
        if (res.transaction?.week) {
          setChartData(res.transaction.week);
        }
        break;
      case TOverviewTimeType.Month:
        if (res.transaction?.month) {
          setChartData(res.transaction.month);
        }
        break;

      default:
        break;
    }
  }, []);

  const onSwitchPeriod = useCallback(
    (time: TOverviewTimeType) => {
      getData(time);
    },
    [getData],
  );

  useEffectOnce(() => {
    // getData(TOverviewTimeType.Day);
  });

  return (
    <div className={clsx(styles['transaction-charts-container'])}>
      <BarChartHeader
        legendList={OverviewLegendList}
        title="Transaction"
        plusCount={''}
        countUnit="Txs"
        depositCount={''}
        withdrawCount={''}
        time={''}
        switchPeriod={onSwitchPeriod}
      />
      <Space direction={'vertical'} size={16} />
      <ECharts
        className={clsx(styles['transaction-charts'])}
        option={option}
        mouseoverCallback={mouseoverCallback}
        mouseoutCallback={mouseoutCallback}
        globaloutCallback={globaloutCallback}
      />
    </div>
  );
}
