import { TGetRecordsListRequest, TGetRecordsListResult } from 'types/api';
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

export const postRecordRead = async (): Promise<null> => {
  try {
    const res = await request.records.postRecordRead();
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'postRecordRead error', false);
  }
};
