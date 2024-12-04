import { Form, Input, InputProps } from 'antd';
import ConnectWalletAndAddress from 'components/ConnectWalletAndAddress';
import CommonButton, { CommonButtonSize } from 'components/CommonButton';
import TokenSelect from './TokenSelect';
import useAelf from 'hooks/wallet/useAelf';
import { TTokenInformationFormValues, TokenInformationFormKeys } from 'types/listing';
import {
  TOKEN_INFORMATION_FORM_LABEL_MAP,
  TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP,
} from 'constants/listing';
import { SupportedChainId } from 'constants/index';
import styles from './styles.module.scss';

const COMMON_INPUT_PROPS: InputProps = {
  size: 'large',
  allowClear: true,
};

export default function TokenInformation() {
  const [form] = Form.useForm<TTokenInformationFormValues>();
  const { isConnected, connector } = useAelf();

  return (
    <div className={styles['token-information']}>
      <Form className={styles['token-information-form']} form={form} layout="vertical">
        <Form.Item
          label={
            <div className={styles['token-information-form-label-wrapper']}>
              <span className={styles['token-information-form-label']}>
                {TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.AELF_CHAIN_TOKEN]}
              </span>
              <ConnectWalletAndAddress
                network={SupportedChainId.sideChain}
                isConnected={isConnected}
                connector={connector}
              />
            </div>
          }
          name={TokenInformationFormKeys.AELF_CHAIN_TOKEN}>
          <TokenSelect
            symbol=""
            name=""
            placeholder={
              TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[TokenInformationFormKeys.AELF_CHAIN_TOKEN]
            }
          />
        </Form.Item>
        <Form.Item
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.WEBSITE]}
          name={TokenInformationFormKeys.WEBSITE}>
          <Input
            {...COMMON_INPUT_PROPS}
            placeholder={TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[TokenInformationFormKeys.WEBSITE]}
          />
        </Form.Item>
        <Form.Item
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.TWITTER]}
          name={TokenInformationFormKeys.TWITTER}>
          <Input
            {...COMMON_INPUT_PROPS}
            placeholder={TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[TokenInformationFormKeys.TWITTER]}
          />
        </Form.Item>
        <Form.Item
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.TITLE]}
          name={TokenInformationFormKeys.TITLE}>
          <Input
            {...COMMON_INPUT_PROPS}
            placeholder={TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[TokenInformationFormKeys.TITLE]}
          />
        </Form.Item>
        <Form.Item
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.NAME]}
          name={TokenInformationFormKeys.NAME}>
          <Input
            {...COMMON_INPUT_PROPS}
            placeholder={TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[TokenInformationFormKeys.NAME]}
          />
        </Form.Item>
        <Form.Item
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.TELEGRAM]}
          name={TokenInformationFormKeys.TELEGRAM}>
          <Input
            {...COMMON_INPUT_PROPS}
            placeholder={TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[TokenInformationFormKeys.TELEGRAM]}
          />
        </Form.Item>
        <Form.Item
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.EMAIL]}
          name={TokenInformationFormKeys.EMAIL}>
          <Input
            {...COMMON_INPUT_PROPS}
            placeholder={TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[TokenInformationFormKeys.EMAIL]}
          />
        </Form.Item>
      </Form>
      <CommonButton
        className={styles['token-information-next-button']}
        size={CommonButtonSize.Small}>
        Next
      </CommonButton>
    </div>
  );
}
