import { request } from 'api';
import { formatApiError } from './error';
import {
  TAddApplicationChainRequest,
  TAddApplicationChainResult,
  TGetApplicationChainStatusListRequest,
  TGetApplicationChainStatusListResult,
  TGetApplicationDetailRequest,
  TGetApplicationDetailResult,
  TGetApplicationIssueResult,
  TGetApplicationTokenInfoRequest,
  TGetApplicationTokenInfoResult,
  TGetApplicationTokenListResult,
  TCommitTokenInfoRequest,
  TCommitTokenInfoResult,
  TGetMyApplicationListRequest,
  TGetMyApplicationListResult,
  TPrepareBindIssueRequest,
  TPrepareBindIssueResult,
} from 'types/api';

export const getApplicationTokenList = async (): Promise<TGetApplicationTokenListResult> => {
  try {
    const res = await request.application.getTokenList();
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getApplicationTokenList error', false);
  }
};

export const commitTokenInfo = async (
  params: TCommitTokenInfoRequest,
): Promise<TCommitTokenInfoResult> => {
  // return true;
  try {
    const res = await request.application.commitTokenInfo({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'commitTokenInfo error', false);
  }
};

export const getApplicationTokenInfo = async (
  params: TGetApplicationTokenInfoRequest,
): Promise<TGetApplicationTokenInfoResult> => {
  try {
    const res = await request.application.getTokenInfo({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getApplicationTokenInfo error', false);
  }
};

export const getApplicationChainStatusList = async (
  params: TGetApplicationChainStatusListRequest,
): Promise<TGetApplicationChainStatusListResult> => {
  try {
    const res = await request.application.getChainStatus({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getApplicationChainStatusList error', false);
  }
};

export const addApplicationChain = async (
  params: TAddApplicationChainRequest,
): Promise<TAddApplicationChainResult> => {
  try {
    const res = await request.application.addChain({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'addApplicationChain error', false);
  }
};

export const prepareBindIssue = async (
  params: TPrepareBindIssueRequest,
): Promise<TPrepareBindIssueResult> => {
  try {
    const res = await request.application.prepareBindIssue({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'prepareBindIssue error', false);
  }
};

export const getApplicationIssue = async (id: string): Promise<TGetApplicationIssueResult> => {
  try {
    const res = await request.application.getIssue({ query: id });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getApplicationIssue error', false);
  }
};

export const getMyApplicationList = async (
  params: TGetMyApplicationListRequest,
): Promise<TGetMyApplicationListResult> => {
  try {
    const res = await request.application.getMyApplicationList({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getMyApplicationList error', false);
  }
};

export const getApplicationDetail = async (
  params: TGetApplicationDetailRequest,
): Promise<TGetApplicationDetailResult> => {
  try {
    const res = await request.application.getApplicationDetail({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getApplicationDetail error', false);
  }
};
