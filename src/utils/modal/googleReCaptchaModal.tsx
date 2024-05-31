import { Modal } from 'antd';
// import { RE_CAPTCHA_SITE_KEY } from 'constants/misc';
import GoogleReCaptcha from 'pageComponents/GoogleReCaptcha';
import { ReCaptchaType } from 'pageComponents/GoogleReCaptcha/types';

type TGoogleReCaptchaResult = { type: ReCaptchaType; data: string | any; error?: any };

console.log(
  'ReCaptcha - NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID1',
  process.env.NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID,
);
console.log(
  'ReCaptcha - NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
);

const googleReCaptchaModal = async (
  width?: number,
): Promise<TGoogleReCaptchaResult | undefined | any> => {
  console.log(
    'NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID1',
    process.env.NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID,
  );
  console.log('NEXT_PUBLIC_RECAPTCHA_SITE_KEY', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
  return new Promise((resolve, reject) => {
    const modal = Modal.info({
      wrapClassName: 'reCaptcha-modal-wrapper',
      className: 'reCaptcha-modal-container',
      width: width,
      content: (
        <GoogleReCaptcha
          siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          theme="light"
          size="normal"
          onSuccess={(res) => {
            resolve({ type: ReCaptchaType.success, data: res });
            modal.destroy();
          }}
          onError={(error) => {
            console.log('error', error);
            reject({ type: ReCaptchaType.error, error });
            modal.destroy();
          }}
          onExpire={(res) => {
            console.log('res', res);
            reject({ type: ReCaptchaType.expire, data: res });
            modal.destroy();
          }}
        />
      ),
      onCancel: () => {
        reject({
          type: ReCaptchaType.cancel,
          data: 'User canceled the verification',
        });
        modal.destroy();
      },
    });
  });
};

export default googleReCaptchaModal;
