import { forwardRef } from 'react';
import { Empty } from 'antd';
import Charts, { eChartsElementEvent } from './Charts';
import clsx from 'clsx';
import { EChartsOption } from 'echarts';
import CircleLoading from 'components/CircleLoading';

const ECharts = forwardRef(
  (
    {
      disabled,
      loading,
      className,
      noData,
      option,
      mouseoverCallback,
      mouseoutCallback,
      globaloutCallback,
    }: {
      disabled?: boolean;
      noData?: boolean;
      loading?: boolean;
      option?: EChartsOption;
      className?: string;
      mouseoverCallback?: (event: eChartsElementEvent) => void;
      mouseoutCallback?: (event: eChartsElementEvent) => void;
      globaloutCallback?: (event: eChartsElementEvent) => void;
    },
    ref,
  ) => {
    if (loading) {
      return (
        <div className={clsx('row-center', className)}>
          <CircleLoading />
        </div>
      );
    }
    if (noData) {
      return (
        <Empty className={clsx('row-center', className)} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    }

    return (
      <Charts
        ref={ref}
        option={option}
        disabled={disabled}
        className={className}
        mouseoverCallback={mouseoverCallback}
        mouseoutCallback={mouseoutCallback}
        globaloutCallback={globaloutCallback}
      />
    );
  },
);

ECharts.displayName = 'ECharts';

export default ECharts;
