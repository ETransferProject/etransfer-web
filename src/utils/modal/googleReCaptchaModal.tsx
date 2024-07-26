import { Modal } from 'antd';
import CloseIcon from 'assets/images/close.svg';
import { RECAPTCHA_SITE_KEY_MAINNET, RECAPTCHA_SITE_KEY_TESTNET } from 'constants/misc';
import { NETWORK_TYPE } from 'constants/index';
import GoogleReCaptcha from 'components/GoogleRecaptcha';
import { ReCaptchaType } from 'components/GoogleRecaptcha/types';

type TGoogleReCaptchaResult = { type: ReCaptchaType; data: string | any; error?: any };

const googleReCaptchaModal = async (
  width?: number,
): Promise<TGoogleReCaptchaResult | undefined | any> => {
  const RECAPTCHA_SITE_KEY =
    NETWORK_TYPE === 'TESTNET' ? RECAPTCHA_SITE_KEY_TESTNET : RECAPTCHA_SITE_KEY_MAINNET;
  return new Promise((resolve, reject) => {
    const modal = Modal.info({
      closable: true,
      closeIcon: <CloseIcon />,
      wrapClassName: 'etransfer-web-reCaptcha-modal-wrapper',
      className: 'etransfer-web-reCaptcha-modal-container',
      width: width,
      content: RECAPTCHA_SITE_KEY ? (
        <GoogleReCaptcha
          siteKey={RECAPTCHA_SITE_KEY}
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
