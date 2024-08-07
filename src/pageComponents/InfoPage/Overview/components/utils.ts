import { EChartsOption, SeriesOption } from 'echarts';
import moment from 'moment';
import { BusinessType } from 'types/api';

export interface GenerateStackBarOptionPrams {
  data: Array<{ date: string } & Record<string, string | number>>;
  depositKey: string;
  withdrawKey: string;
  stackName: string;
  opacity: number;
  emphasisOpacity: number;
  dateFormat?: string;
}

export const generateStackBarOption = ({
  data,
  depositKey,
  withdrawKey,
  stackName,
  opacity,
  emphasisOpacity,
  dateFormat = 'MMM D',
}: GenerateStackBarOptionPrams): EChartsOption => {
  const withdrawData: { value: string | number }[] = [],
    depositData: { value: string | number }[] = [],
    xAxisData: string[] = [];

  data.forEach((item) => {
    withdrawData.push({ value: item[withdrawKey] });
    depositData.push({ value: item[depositKey] });
    xAxisData.push(item.date);
  });

  const series: SeriesOption[] = [
    {
      data: withdrawData,
      type: 'bar',
      stack: stackName,
      name: BusinessType.Withdraw,
      // barCategoryGap: 2,
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
      data: depositData,
      type: 'bar',
      stack: stackName,
      name: BusinessType.Deposit,
      // barCategoryGap: 2,
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
      axisLabel: {
        overflow: 'breakAll',
        // showMinLabel: false,
        // showMaxLabel: false,
        // alignMinLabel: 'left',
        // alignMaxLabel: 'right',
        formatter: function (value) {
          return moment(value, 'YYYY-MM-DD').format(dateFormat);
        },
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLine: { show: false },
      boundaryGap: true,
      nameLocation: 'middle',
    },
    yAxis: {
      show: false,
      // type: 'value',
      // splitLine: { show: false },
      // axisTick: { show: false },
      // axisLine: { show: false },
    },
    grid: { top: '0', left: '16px', right: '16px', bottom: '28px' },
    series: series,
    // tooltip: {
    //   trigger: 'axis',
    //   showDelay: 0,
    //   axisPointer: {
    //     type: 'shadow',
    //     shadowStyle: {
    //       shadowBlur: 0,
    //     },
    //   },
    //   showContent: false,
    // },
  };
};
