import { TGetRecordsListRequest, TGetRecordsListResult } from 'types/api';
import { TCurrentRecordsStatus } from 'types/records';
import { handleErrorMessage } from '@portkey/did-ui-react';
import { request } from 'api';

export const getRecordsList = async (
  params: TGetRecordsListRequest,
): Promise<TGetRecordsListResult> => {
  try {
    const res = await request.records.getRecordsList({ params });
    return res.data;
  } catch (error: any) {
    const newError: any = new Error(handleErrorMessage(error, 'getRecordsList error'));

    newError.code = error?.code;
    throw newError;
  }
};

export const getRecordStatus = async (): Promise<TCurrentRecordsStatus> => {
  try {
    const res = await request.records.getRecordStatus();
    return res.data;
  } catch (error: any) {
    const newError: any = new Error(handleErrorMessage(error, 'getRecordStatus error'));

    newError.code = error?.code;
    throw newError;
  }
};

export const postRecordRead = async (): Promise<null> => {
  try {
    const res = await request.records.postRecordRead();
    return res.data;
  } catch (error: any) {
    const newError: any = new Error(handleErrorMessage(error, 'postRecordRead error'));

    newError.code = error?.code;
    throw newError;
  }
};
