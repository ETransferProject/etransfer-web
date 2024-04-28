import { handleErrorMessage } from '@portkey/did-ui-react';

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
