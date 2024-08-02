import { handleErrorMessage } from '@etransfer/utils';
import { CommonErrorNameType } from 'api/types';
import axios from 'axios';

export const isHtmlError = (code: string | number, message: string) => {
  if (String(code)?.substring(0, 1) === '5' && message.includes('<!DOCTYPE HTML PUBLIC')) {
    return true;
  }
  return false;
};

export const isWriteOperationError = (code: string | number, message: string) => {
  if (
    String(code)?.substring(0, 1) === '5' &&
    message.includes('A write operation resulted in an error')
  ) {
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

export const handleWebLoginErrorMessage = (error: any, errorText?: string) => {
  if (error.nativeError && error.nativeError.message) {
    error = error.nativeError;
  }

  return handleErrorMessage(error, errorText);
};
