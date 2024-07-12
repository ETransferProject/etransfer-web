import { TokenType } from 'constants/index';
import { TTokenDashboardRequest } from 'types/api';
import { TTokenDashboardItem, TTokenDashboardItemDetail } from 'types/infoDashboard';
import { getTokenDashboard as getTokenDashboardApi } from 'utils/api/infoDashboard';

export const getTokenDashboard = async (params: TTokenDashboardRequest) => {
  const data = await getTokenDashboardApi(params);
  const list: TTokenDashboardItem[] = [];

  Object.keys(data).forEach((key) => {
    const keyNew = key as TokenType;

    const item = data[keyNew];

    const detailList: TTokenDashboardItemDetail[] = [];

    data[keyNew].details?.forEach((detail) => {
      detailList.push({
        name: detail.name,
        volume24H: detail.item.amount24H,
        volume7D: detail.item.amount7D,
        volumeTotal: detail.item.amountTotal,
        volume24HUsd: detail.item.amount24HUsd,
        volume7DUsd: detail.item.amount7DUsd,
        volumeTotalUsd: detail.item.amountTotalUsd,
      });
    });

    list.push({
      symbol: key,
      symbolIcon: item.icon,
      aelfChain: item.chainIds,
      networks: item.networks,
      volume24H: item.general.amount24H,
      volume7D: item.general.amount7D,
      volumeTotal: item.general.amountTotal,
      volume24HUsd: item.general.amount24HUsd,
      volume7DUsd: item.general.amount7DUsd,
      volumeTotalUsd: item.general.amountTotalUsd,
      details: detailList,
    });
  });

  return list;
};
