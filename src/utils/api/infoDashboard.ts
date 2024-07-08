import { request } from 'api';
import { formatApiError } from './error';
import {
  TTokenDashboardRequest,
  TTokenDashboardResult,
  TTransactionOverviewRequest,
  TTransactionOverviewResult,
  TTransferDashboardFilterResult,
  TTransferDashboardRequest,
  TTransferDashboardResult,
  TVolumeOverviewRequest,
  TVolumeOverviewResult,
} from 'types/api';

export const getTransactionOverview = async (
  params: TTransactionOverviewRequest,
): Promise<TTransactionOverviewResult> => {
  try {
    const res = await request.infoDashboard.getTransactionOverview({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getTokenList error', false);
  }
};

export const getVolumeOverview = async (
  params: TVolumeOverviewRequest,
): Promise<TVolumeOverviewResult> => {
  try {
    const res = await request.infoDashboard.getVolumeOverview({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getVolumeOverview error', false);
  }
};

export const getTokenDashboard = async (
  params: TTokenDashboardRequest,
): Promise<TTokenDashboardResult> => {
  try {
    const res = await request.infoDashboard.getTokens({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getTokenDashboard error', false);
  }
};

export const getNetworkOption = async (): Promise<TTransferDashboardFilterResult> => {
  try {
    const res = await request.infoDashboard.getNetworkOption();
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getNetworkOption error', false);
  }
};

export const geTransfers = async (
  params: TTransferDashboardRequest,
): Promise<TTransferDashboardResult> => {
  try {
    const res = await request.infoDashboard.geTransfers({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'geTransfers error', false);
  }
};
