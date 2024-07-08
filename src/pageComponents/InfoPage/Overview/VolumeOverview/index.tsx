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
import { getVolumeOverview } from 'utils/api/infoDashboard';
import { useEffectOnce } from 'react-use';
import { TOverviewTimeType, TVolumeOverviewItem } from 'types/api';

export default function VolumeOverview() {
  const [opacity, setOpacity] = useState(1);
  const [chartData, setChartData] = useState<TVolumeOverviewItem[]>([]);

  const option = useMemo<EChartsOption>(() => {
    return generateStackBarOption({
      data: [
        { date: '01', depositTx: 100, withdrawTx: 150 },
        { date: '02', depositTx: 10, withdrawTx: 50 },
      ],
      stackName: 'volume',
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
    const res = await getVolumeOverview({
      type: time,
    });

    switch (time) {
      case TOverviewTimeType.Day:
        if (res.volume?.day) {
          setChartData(res.volume.day);
        }

        break;
      case TOverviewTimeType.Week:
        if (res.volume?.week) {
          setChartData(res.volume.week);
        }
        break;
      case TOverviewTimeType.Month:
        if (res.volume?.month) {
          setChartData(res.volume.month);
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
    <div className={clsx(styles['volume-charts-container'])}>
      <BarChartHeader
        legendList={OverviewLegendList}
        title="Volume"
        plusCount={''}
        countUnit="M" // TODO
        depositCount={''}
        withdrawCount={''}
        time={''}
        switchPeriod={onSwitchPeriod}
      />
      <Space direction={'vertical'} size={16} />
      <ECharts
        className={clsx(styles['volume-charts'])}
        option={option}
        mouseoverCallback={mouseoverCallback}
        mouseoutCallback={mouseoutCallback}
        globaloutCallback={globaloutCallback}
      />
    </div>
  );
}
