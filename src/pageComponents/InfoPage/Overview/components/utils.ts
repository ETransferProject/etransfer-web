import { EChartsOption, SeriesOption } from 'echarts';
import { BusinessType, TTransactionOverviewItem } from 'types/api';

export interface GenerateStackBarOptionPrams {
  data: TTransactionOverviewItem[];
  stackName: string;
  opacity: number;
  emphasisOpacity: number;
}

export const generateStackBarOption = ({
  data,
  stackName,
  opacity,
  emphasisOpacity,
}: GenerateStackBarOptionPrams): EChartsOption => {
  const withdrawData: { value: number }[] = [],
    depositData: { value: number }[] = [],
    xAxisData: string[] = [];

  data.forEach((item) => {
    withdrawData.push({ value: item.withdrawTx });
    depositData.push({ value: item.depositTx });
    xAxisData.push(item.date);
  });

  const series: SeriesOption[] = [
    {
      data: withdrawData, // [50, 46, 64, 60, 30, 90, 100, 50, 46, 64, 60, 30, 90, 100],
      type: 'bar',
      stack: stackName,
      name: BusinessType.Withdraw,
      barCategoryGap: 2,
      itemStyle: {
        color: '#41DAFB',
        opacity: opacity,
        borderRadius: [0, 0, 4, 4],
      },
      emphasis: {
        itemStyle: {
          color: '#41DAFB',
          opacity: emphasisOpacity,
        },
      },
    },
    {
      data: depositData, // [50, 100, 150, 80, 70, 110, 130, 50, 100, 150, 80, 70, 110, 130],
      type: 'bar',
      stack: stackName,
      name: BusinessType.Deposit,
      barCategoryGap: 2,
      itemStyle: {
        color: '#916BFF',
        opacity: opacity,
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: {
          color: '#916BFF',
          opacity: emphasisOpacity,
        },
      },
    },
  ];

  return {
    xAxis: {
      type: 'category',
      data: xAxisData,
      nameTextStyle: {
        fontSize: 12,
        color: '#808080',
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { show: false },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    grid: { top: '0', left: '0', right: '0', bottom: '28px' },
    series: series,
    //   tooltip: {
    //     trigger: 'axis',
    //     showDelay: 0,
    //     axisPointer: {
    //       type: 'none',
    //       //   shadowStyle: {
    //       //     color: 'rgba(245, 245, 245, 0.15)',
    //       //     width: '0',
    //       //   },
    //     },
    //   },
  };
};
