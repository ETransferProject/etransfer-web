import clsx from 'clsx';
import BarChartLegend, { ChartLegendItem } from '../BarChartLegend';
import styles from './styles.module.scss';
import { useCallback, useState } from 'react';
import { TOverviewTimeType } from 'types/api';

export interface BarChartHeaderProps {
  title: string;
  plusCount: string;
  countUnit: string;
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
  time,
  legendList,
  switchPeriod,
}: BarChartHeaderProps) {
  const [timePeriodSelected, setTimePeriodSelected] = useState(TIME_SELECTOR_OPTIONS[0].time);

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
        <div className={styles['plus-count']}>{plusCount && `${plusCount} ${countUnit}`}</div>
        <div className={styles['time']}>{time}</div>
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
          depositCount={depositCount}
          withdrawCount={withdrawCount}
          countUnit={countUnit}
        />
      </div>
    </div>
  );
}
