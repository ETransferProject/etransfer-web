import clsx from 'clsx';
import BarChartLegend, { ChartLegendItem } from '../BarChartLegend';
import styles from './styles.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { TOverviewTimeType } from 'types/api';
import moment from 'moment';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { DATE_FORMATE, DATE_FORMATE_MMM_D_YYYY } from 'constants/misc';

export interface BarChartHeaderProps {
  className?: string;
  title: string;
  plusCount: string;
  countUnit: string;
  unitPosition?: 'prefix' | 'suffix';
  depositCount?: string;
  transferCount?: string;
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
  className,
  title,
  plusCount,
  depositCount,
  transferCount,
  countUnit,
  unitPosition = 'suffix',
  time,
  legendList,
  switchPeriod,
}: BarChartHeaderProps) {
  const [timePeriodSelected, setTimePeriodSelected] = useState(TIME_SELECTOR_OPTIONS[0].time);

  const formatDate = useMemo(() => {
    if (!time) return DEFAULT_NULL_VALUE;
    return moment(time, DATE_FORMATE).format(DATE_FORMATE_MMM_D_YYYY);
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
    <div className={clsx('flex-row-between', styles['bar-chart-header'], className)}>
      <div className={styles['left']}>
        <div className={styles['title']}>{title}</div>
        <div className={styles['plus-count']}>
          {plusCount &&
            `${unitPosition === 'prefix' ? countUnit : ''}${formatNumber(plusCount)}${
              unitPosition === 'suffix' ? countUnit : ''
            }`}
        </div>
        <div className={styles['time']}>
          {formatDate}
          {' (UTC)'}
        </div>
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
          transferCount={formatNumber(transferCount)}
          countUnit={countUnit}
          unitPosition={unitPosition}
        />
      </div>
    </div>
  );
}
