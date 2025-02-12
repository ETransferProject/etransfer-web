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
    throw formatApiError(error, 'getTransactionOverview error', false);
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

export const getTransferFilterOption = async (): Promise<TTransferDashboardFilterResult> => {
  try {
    const res = await request.infoDashboard.getNetworkOption();
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getTransferFilterOption error', false);
  }
};

export const getTransferDashboard = async (
  params: TTransferDashboardRequest,
): Promise<TTransferDashboardResult> => {
  try {
    const res = await request.infoDashboard.geTransfers({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getTransferDashboard error', false);
  }
};
