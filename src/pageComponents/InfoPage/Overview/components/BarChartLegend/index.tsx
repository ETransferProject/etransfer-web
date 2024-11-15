import clsx from 'clsx';
import styles from './styles.module.scss';
import { BusinessType } from 'types/api';
import { useCallback } from 'react';

export interface ChartLegendItem {
  color: string;
  label: string;
}

export interface BarChartLegendProps {
  className?: string;
  legendList: ChartLegendItem[];
  countUnit: string;
  unitPosition?: 'prefix' | 'suffix';
  depositCount?: string;
  transferCount?: string;
}

export default function BarChartLegend({
  className,
  legendList,
  countUnit,
  unitPosition,
  depositCount,
  transferCount,
}: BarChartLegendProps) {
  const count = useCallback(
    (key: string) => {
      if (key === BusinessType.Deposit && depositCount && countUnit) {
        return `${unitPosition === 'prefix' ? countUnit : ''}${depositCount}${
          unitPosition === 'suffix' ? countUnit : ''
        }`;
      }
      if (key === BusinessType.Transfer && transferCount && countUnit) {
        return `${unitPosition === 'prefix' ? countUnit : ''}${transferCount}${
          unitPosition === 'suffix' ? countUnit : ''
        }`;
      }

      return key;
    },
    [countUnit, depositCount, unitPosition, transferCount],
  );

  return (
    <div className={clsx('flex-column', styles['bar-chart-legend'], className)}>
      {legendList.map((item) => {
        return (
          <div
            key={`chart-legend-${item.label}`}
            className={clsx('flex-row-center', styles['bar-chart-legend-item'])}>
            <div className={styles['bar-chart-legend-label']}>
              {count(item.label) || item.label}
            </div>
            <div
              className={styles['bar-chart-legend-color']}
              style={{ backgroundColor: item.color }}
            />
          </div>
        );
      })}
    </div>
  );
}
