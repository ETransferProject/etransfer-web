export const isHtmlError = (code: string | number, message: string) => {
  if (String(code)?.substring(0, 1) === '5' && message.includes('<!DOCTYPE HTML PUBLIC')) {
    return true;
  }
  return false;
};
