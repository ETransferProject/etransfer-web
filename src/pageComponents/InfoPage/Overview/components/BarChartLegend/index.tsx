import clsx from 'clsx';
import styles from './styles.module.scss';
import { BusinessType } from 'types/api';
import { useCallback } from 'react';

export interface ChartLegendItem {
  color: string;
  label: BusinessType;
}

export interface BarChartLegendProps {
  className?: string;
  legendList: ChartLegendItem[];
  countUnit: string;
  depositCount?: string;
  withdrawCount?: string;
}

export default function BarChartLegend({
  className,
  legendList,
  countUnit,
  depositCount,
  withdrawCount,
}: BarChartLegendProps) {
  const count = useCallback(
    (key: BusinessType) => {
      return key === BusinessType.Deposit
        ? `${depositCount} ${countUnit}`
        : `${withdrawCount} ${countUnit}`;
    },
    [countUnit, depositCount, withdrawCount],
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
