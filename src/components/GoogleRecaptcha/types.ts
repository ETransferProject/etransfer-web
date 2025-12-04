export enum ReCaptchaType {
  success = 'success',
  error = 'error',
  cancel = 'cancel',
  expire = 'expired',
}

export interface BaseReCaptcha {
  siteKey?: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  customReCaptchaHandler?: () => Promise<{
    type: ReCaptchaType;
    message?: any;
  }>;
}

export interface GoogleReCaptchaProps extends BaseReCaptcha {
  onSuccess?: (result: string) => any;
  onExpired?: (e?: any) => any;
  onError?: (e?: any) => any;
}
