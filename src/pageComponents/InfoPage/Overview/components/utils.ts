import { DATE_FORMATE } from 'constants/misc';
import { EChartsOption, SeriesOption } from 'echarts';
import moment from 'moment';
import { BusinessType } from 'types/api';

export interface GenerateStackBarOptionPrams {
  data: Array<{ date: string } & Record<string, string | number>>;
  depositKey: string;
  transferKey: string;
  stackName: string;
  opacity: number;
  emphasisOpacity: number;
  dateFormat?: string;
}

export const generateStackBarOption = ({
  data,
  depositKey,
  transferKey,
  stackName,
  opacity,
  emphasisOpacity,
  dateFormat = 'MMM D',
}: GenerateStackBarOptionPrams): EChartsOption => {
  const transferData: { value: string | number }[] = [],
    depositData: { value: string | number }[] = [],
    xAxisData: string[] = [];

  data.forEach((item) => {
    transferData.push({ value: item[transferKey] });
    depositData.push({ value: item[depositKey] });
    xAxisData.push(item.date);
  });

  const series: SeriesOption[] = [
    {
      data: transferData,
      type: 'bar',
      stack: stackName,
      name: BusinessType.Transfer,
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
          return moment(value, DATE_FORMATE).format(dateFormat);
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
