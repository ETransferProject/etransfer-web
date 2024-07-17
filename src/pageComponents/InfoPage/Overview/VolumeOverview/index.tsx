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
import { getVolumeOverview } from 'utils/api/infoDashboard';
import { useEffectOnce } from 'react-use';
import { TOverviewTimeType, TVolumeOverviewItem } from 'types/api';
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

export default function VolumeOverview() {
  const dataMapRef = useRef<Record<string, Partial<TVolumeOverviewItem>>>({});
  const [opacity, setOpacity] = useState(1);
  const [chartData, setChartData] = useState<TVolumeOverviewItem[]>([]);
  const [totalItem, setTotalItem] = useState<TTotalItem>();
  const [currentItem, setCurrentItem] = useState<TCurrentItem>();
  const [loading, setLoading] = useState(true);

  const option = useMemo<EChartsOption>(() => {
    return generateStackBarOption({
      data: chartData,
      depositKey: 'depositAmountUsd',
      withdrawKey: 'withdrawAmountUsd',
      stackName: 'volume',
      opacity: opacity,
      emphasisOpacity: 1,
    });
  }, [chartData, opacity]);

  const mouseoverCallback = useCallback((event: eChartsElementEvent) => {
    setOpacity(0.2);
    const dataItem = dataMapRef.current?.[event?.name] || {};
    setCurrentItem({
      deposit: dataItem.depositAmountUsd || '',
      withdraw: dataItem.withdrawAmountUsd || '',
      plus: computePlus(dataItem.depositAmountUsd, dataItem.withdrawAmountUsd),
      date: event?.name,
    });
  }, []);

  const mouseoutCallback = useCallback(() => {
    setOpacity(1);

    setCurrentItem({
      deposit: '',
      withdraw: '',
      plus: totalItem?.plus || '',
      date: totalItem?.date || '',
    });
  }, [totalItem?.date, totalItem?.plus]);

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
    [totalItem],
    100,
  );

  const getData = useCallback(async (time: TOverviewTimeType) => {
    try {
      setLoading(true);
      const res = await getVolumeOverview({
        type: time,
      });

      let list: TVolumeOverviewItem[] = [];

      switch (time) {
        case TOverviewTimeType.Day:
          if (res.volume?.day) {
            list = res.volume.day;
          }

          break;
        case TOverviewTimeType.Week:
          if (res.volume?.week) {
            list = res.volume.week;
          }
          break;
        case TOverviewTimeType.Month:
          if (res.volume?.month) {
            list = res.volume.month;
          }
          break;

        default:
          break;
      }

      dataMapRef.current = Object.fromEntries(list.map((item) => [item.date, item]));

      setChartData(list);
      setTotalItem({
        plus: res.volume.totalAmountUsd,
        date: res.volume.latest,
      });
      setCurrentItem({
        deposit: '',
        withdraw: '',
        plus: res.volume.totalAmountUsd,
        date: res.volume.latest,
      });
    } catch (error) {
      console.log('VolumeOverview get data error', error);
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
    <div className={clsx('flex-1', styles['volume-charts-container'])}>
      <BarChartHeader
        legendList={OverviewLegendList}
        title="Volume"
        plusCount={currentItem?.plus || ''}
        countUnit="$"
        unitPosition="prefix"
        depositCount={currentItem?.deposit}
        withdrawCount={currentItem?.withdraw}
        time={currentItem?.date || ''}
        switchPeriod={onSwitchPeriod}
      />
      <Space direction={'vertical'} size={16} />
      <ECharts
        loading={loading}
        className={clsx(styles['volume-charts'])}
        option={option}
        mouseoverCallback={mouseoverCallback}
        mouseoutCallback={mouseoutCallback}
        globaloutCallback={globaloutCallback}
      />
    </div>
  );
}
