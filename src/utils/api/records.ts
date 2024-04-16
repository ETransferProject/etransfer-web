import { GetRecordsListRequest, GetRecordsListResult } from 'types/api';
import { currentRecordsStatus } from 'types/records';
import { handleErrorMessage } from '@portkey/did-ui-react';
import { request } from 'api';

export const getRecordsList = async (
  params: GetRecordsListRequest,
): Promise<GetRecordsListResult> => {
  try {
    const res = await request.records.getRecordsList({ params });
    return res.data;
  } catch (error: any) {
    const newError: any = new Error(handleErrorMessage(error, 'getRecordsList error'));

    newError.code = error?.code;
    throw newError;
  }
};

export const getRecordStatus = async (): Promise<currentRecordsStatus> => {
  try {
    const res = await request.records.getRecordStatus();
    return res.data;
  } catch (error: any) {
    const newError: any = new Error(handleErrorMessage(error, 'getRecordStatus error'));

    newError.code = error?.code;
    throw newError;
  }
};
