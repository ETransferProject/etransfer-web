import { Modal } from 'antd';
import CloseIcon from 'assets/images/close.svg';
import { RE_CAPTCHA_SITE_KEY } from 'constants/misc';
import GoogleReCaptcha from 'components/GoogleRecaptcha';
import { ReCaptchaType } from 'components/GoogleRecaptcha/types';

type TGoogleReCaptchaResult = { type: ReCaptchaType; data: string | any; error?: any };

const googleReCaptchaModal = async (
  width?: number,
): Promise<TGoogleReCaptchaResult | undefined | any> => {
  return new Promise((resolve, reject) => {
    const modal = Modal.info({
      closable: true,
      closeIcon: <CloseIcon />,
      wrapClassName: 'reCaptcha-modal-wrapper',
      className: 'reCaptcha-modal-container',
      width: width,
      content: RE_CAPTCHA_SITE_KEY ? (
        <GoogleReCaptcha
          siteKey={RE_CAPTCHA_SITE_KEY}
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
          onExpired={(res) => {
            console.log('expired', res);
            reject({ type: ReCaptchaType.expire, data: res });
            modal.destroy();
          }}
        />
      ) : (
        'Invalid siteKey'
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
