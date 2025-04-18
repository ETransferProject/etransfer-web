import {
  TGetRecordDetailResult,
  TGetRecordsListRequest,
  TGetRecordsListResult,
  TGetRecordStatusRequest,
} from 'types/api';
import { TCurrentRecordsStatus } from 'types/records';
import { request } from 'api';
import { formatApiError } from './error';
import qs from 'qs';

export const getRecordsList = async (
  params: TGetRecordsListRequest,
  authToken?: string,
): Promise<TGetRecordsListResult> => {
  try {
    const res = await request.records.getRecordsList({
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
      headers: { Authorization: authToken || '' },
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getRecordsList error', false);
  }
};

export const getRecordStatus = async (
  params: TGetRecordStatusRequest,
): Promise<TCurrentRecordsStatus> => {
  try {
    const res = await request.records.getRecordStatus({
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getRecordStatus error', false);
  }
};

export const getRecordDetail = async (id: string): Promise<TGetRecordDetailResult> => {
  try {
    const res = await request.records.getRecordDetail({
      query: id,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getRecordDetail error', false);
  }
};
