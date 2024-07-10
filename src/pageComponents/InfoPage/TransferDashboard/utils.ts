import { TTransferDashboardRequest } from 'types/api';
import { TTransferDashboardData } from 'types/infoDashboard';
import { getTransferDashboard as getTransferDashboardApi } from 'utils/api/infoDashboard';
import moment from 'moment';

export const getTransferDashboard = async (params: TTransferDashboardRequest) => {
  const data = await getTransferDashboardApi(params);
  const list: TTransferDashboardData[] = [];

  data?.items?.forEach((item) => {
    list.push({
      orderType: item.orderType,
      status: item.status,
      createTime: item.createTime,
      fromNetwork: item.fromTransfer.network,
      fromChainId: item.fromTransfer.chainId,
      fromSymbol: item.fromTransfer.symbol,
      fromAddress: item.fromTransfer.fromAddress,
      fromAmount: item.fromTransfer.amount,
      fromAmountUsd: item.fromTransfer.amountUsd,
      fromTxId: item.fromTransfer.txId,
      fromStatus: item.fromTransfer.status,
      toNetwork: item.toTransfer.network,
      toChainId: item.toTransfer.chainId,
      toSymbol: item.toTransfer.symbol,
      toAddress: item.toTransfer.toAddress,
      toAmount: item.toTransfer.amount,
      toAmountUsd: item.toTransfer.amountUsd,
      toTxId: item.toTransfer.txId,
      toFeeInfo: item.toTransfer.feeInfo,
      toStatus: item.toTransfer.status,
    });
  });

  return { list, total: data.totalCount };
};

export const formatTime = (time: number) => {
  const currentTime = new Date();
  const currentTimestamp = moment(currentTime).valueOf();

  const timeDaysDiff = moment(currentTimestamp).diff(moment(time), 'days');
  if (timeDaysDiff > 0) {
    return moment(time).format('MMM D, YYYY hh:mm:ss');
  } else {
    const timeHourDiff = moment(currentTimestamp).diff(moment(time), 'hours');
    if (timeHourDiff > 0) {
      return `${timeHourDiff} hours ago`;
    } else {
      const timeMinDiff = moment(currentTimestamp).diff(moment(time), 'minutes');
      if (timeMinDiff > 0) {
        return `${timeMinDiff} minutes ago`;
      } else {
        return `just now`;
      }
    }
  }
};
