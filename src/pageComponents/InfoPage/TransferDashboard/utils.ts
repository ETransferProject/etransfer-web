import { TTransferDashboardRequest } from 'types/api';
import { TTransferDashboardData } from 'types/infoDashboard';
import { geTransfers as getTransferDashboardApi } from 'utils/api/infoDashboard';

export const getTokenDashboard = async (params: TTransferDashboardRequest) => {
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

  return list;
};
