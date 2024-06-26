import { handleErrorMessage } from '@portkey/did-ui-react';
import { CommonErrorNameType } from 'api/types';
import axios from 'axios';

export const isHtmlError = (code: string | number, message: string) => {
  if (String(code)?.substring(0, 1) === '5' && message.includes('<!DOCTYPE HTML PUBLIC')) {
    return true;
  }
  return false;
};

export const isAuthTokenError = (error: any) => {
  const msg = handleErrorMessage(error);
  if (msg.includes('401')) {
    return true;
  }
  return false;
};

export const formatApiError = (error: any, defaultMassage: string, isSetCancelName = false) => {
  const newError: any = new Error(handleErrorMessage(error, defaultMassage));
  if (isSetCancelName && axios.isCancel(error)) {
    newError.name = CommonErrorNameType.CANCEL;
  }
  newError.code = error?.code;

  return newError;
};
