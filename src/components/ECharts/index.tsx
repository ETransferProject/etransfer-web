import { forwardRef } from 'react';
import { Empty, Spin } from 'antd';
import Charts, { eChartsElementEvent } from './Charts';
import clsx from 'clsx';
import { EChartsOption } from 'echarts';

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
        <div className={clsx('echarts-box', className)}>
          <Spin className="echarts-loading" size="large" />
        </div>
      );
    }
    if (noData) {
      return <Empty className={clsx('echarts-box', className)} />;
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
