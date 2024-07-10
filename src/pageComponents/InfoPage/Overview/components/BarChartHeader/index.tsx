import clsx from 'clsx';
import BarChartLegend, { ChartLegendItem } from '../BarChartLegend';
import styles from './styles.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { TOverviewTimeType } from 'types/api';
import moment from 'moment';

export interface BarChartHeaderProps {
  title: string;
  plusCount: string;
  countUnit: string;
  unitPosition?: 'prefix' | 'suffix';
  depositCount?: string;
  withdrawCount?: string;
  time: string;
  legendList: ChartLegendItem[];
  switchPeriod: (item: TOverviewTimeType) => void;
}

export interface TimePeriodOption {
  time: TOverviewTimeType;
  display: string;
}

const TIME_SELECTOR_OPTIONS: TimePeriodOption[] = [
  { time: TOverviewTimeType.Day, display: 'D' },
  { time: TOverviewTimeType.Week, display: 'W' },
  { time: TOverviewTimeType.Month, display: 'M' },
];

export default function BarChartHeader({
  title,
  plusCount,
  depositCount,
  withdrawCount,
  countUnit,
  unitPosition = 'suffix',
  time,
  legendList,
  switchPeriod,
}: BarChartHeaderProps) {
  const [timePeriodSelected, setTimePeriodSelected] = useState(TIME_SELECTOR_OPTIONS[0].time);

  const formatDate = useMemo(() => {
    return moment(time, 'YYYY-MM-DD').format('MMM D');
  }, [time]);

  const formatNumber = useCallback((num?: number | string): string => {
    if (num == undefined || num == '') return '';

    let number: number;
    if (typeof num === 'string') {
      number = Number(num);
    } else {
      number = num;
    }

    let numNew = String(number);
    if (number >= 1000000) {
      numNew = Math.floor(number / 10000) / 100 + 'M';
    } else if (number >= 1000) {
      numNew = Math.floor(number / 10) / 100 + 'K';
    }

    return numNew;
  }, []);

  const timePeriodChanged = useCallback(
    (item: TimePeriodOption) => {
      setTimePeriodSelected(item.time);
      switchPeriod(item.time);
    },
    [switchPeriod],
  );

  return (
    <div className={clsx('flex-row-between', styles['bar-chart-header'])}>
      <div className={styles['left']}>
        <div className={styles['title']}>{title}</div>
        <div className={styles['plus-count']}>
          {plusCount &&
            `${unitPosition === 'prefix' ? countUnit : ''}${formatNumber(plusCount)}${
              unitPosition === 'suffix' ? countUnit : ''
            }`}
        </div>
        <div className={styles['time']}>{formatDate}</div>
      </div>
      <div className={styles['right']}>
        <div className={clsx('flex-row-center', styles['time-period'])}>
          {TIME_SELECTOR_OPTIONS.map((item) => {
            return (
              <div
                key={`time-selector-option-${item.display}`}
                className={clsx(
                  styles['time-period-item'],
                  timePeriodSelected === item.time && styles['time-period-item-select'],
                )}
                onClick={() => timePeriodChanged(item)}>
                {item.display}
              </div>
            );
          })}
        </div>
        <BarChartLegend
          legendList={legendList}
          depositCount={formatNumber(depositCount)}
          withdrawCount={formatNumber(withdrawCount)}
          countUnit={countUnit}
          unitPosition={unitPosition}
        />
      </div>
    </div>
  );
}
