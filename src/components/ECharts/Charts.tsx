import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as eCharts from 'echarts';
import clsx from 'clsx';
import { useDeepCompareEffect } from 'react-use';
import { useCommonState } from 'store/Provider/hooks';

export type eChartsElementEvent = eCharts.ECElementEvent;

const Charts = forwardRef(
  (
    {
      disabled,
      option,
      className,
      mouseoverCallback,
      mouseoutCallback,
      globaloutCallback,
    }: {
      option?: eCharts.EChartsOption;
      disabled?: boolean;
      className?: string;
      mouseoverCallback?: (event: eChartsElementEvent) => void;
      mouseoutCallback?: (event: eChartsElementEvent) => void;
      globaloutCallback?: (event: eChartsElementEvent) => void;
    },
    ref,
  ) => {
    const ele = useRef<HTMLElement>();

    const [myChart, setMyChart] = useState<eCharts.ECharts>();
    const { isPadPX } = useCommonState();

    useEffect(() => {
      if (!myChart) {
        const chart = eCharts.init(ele.current as HTMLDivElement, undefined, {
          renderer: 'svg',
        });
        setMyChart(chart);

        if (!isPadPX) {
          chart.on('mouseover', function (params) {
            chart.dispatchAction({
              type: 'highlight',
              seriesIndex: [0, 1],
              dataIndex: params.dataIndex,
            });
            mouseoverCallback?.(params);
          });

          chart.on('mouseout', function (params) {
            chart.dispatchAction({
              type: 'downplay',
              seriesIndex: [0, 1],
              dataIndex: params.dataIndex,
            });
            mouseoutCallback?.(params);
          });

          chart.on('globalout', function (params) {
            globaloutCallback?.(params);
          });
        }
      }
    }, [globaloutCallback, isPadPX, mouseoutCallback, mouseoverCallback, myChart]);

    useEffect(() => {
      if (myChart) {
        const resize = () => myChart.resize();
        const timer = setTimeout(resize, 1);
        window.addEventListener('resize', resize);

        return () => {
          timer && clearTimeout(timer);
          window.removeEventListener('resize', resize);
        };
      } else {
        return;
      }
    }, [myChart]);

    useDeepCompareEffect(() => {
      option &&
        myChart?.setOption(
          {
            ...option,
          },
          true,
        );
    }, [myChart, option || {}]);

    useImperativeHandle(
      ref,
      () => ({
        myChart,
      }),
      [myChart],
    );

    return (
      <div
        style={{
          position: 'relative',
          ...(disabled ? { pointerEvents: 'none', background: '#f0f0f0' } : {}),
        }}>
        <div ref={ele as any} className={clsx('echarts-box', className)} />
      </div>
    );
  },
);

Charts.displayName = 'Charts';

export default Charts;
