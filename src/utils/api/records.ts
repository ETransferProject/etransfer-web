import { TGetRecordDetailResult, TGetRecordsListRequest, TGetRecordsListResult } from 'types/api';
import { TCurrentRecordsStatus } from 'types/records';
import { request } from 'api';
import { formatApiError } from './error';

export const getRecordsList = async (
  params: TGetRecordsListRequest,
): Promise<TGetRecordsListResult> => {
  try {
    const res = await request.records.getRecordsList({ params });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getRecordsList error', false);
  }
};

export const getRecordStatus = async (): Promise<TCurrentRecordsStatus> => {
  try {
    const res = await request.records.getRecordStatus();
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getRecordStatus error', false);
  }
};

export const getRecordDetail = async (id: string): Promise<TGetRecordDetailResult> => {
  try {
    const res = await request.records.getRecordDetail({ query: id });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getRecordDetail error', false);
  }
};
