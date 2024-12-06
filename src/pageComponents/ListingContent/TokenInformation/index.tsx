import { useCallback, useEffect, useState } from 'react';
import { Form, Input, InputProps } from 'antd';
import ConnectWalletAndAddress from 'components/ConnectWalletAndAddress';
import CommonButton, { CommonButtonSize } from 'components/CommonButton';
import Remind from 'components/Remind';
import TokenSelect from './TokenSelect';
import useAelf from 'hooks/wallet/useAelf';
import { TCommitTokenInfoRequest } from 'types/api';
import {
  TTokenInformationFormValues,
  TokenInformationFormKeys,
  TTokenInformationFormValidateData,
  FormValidateStatus,
  TTokenItem,
} from 'types/listing';
import {
  TOKEN_INFORMATION_FORM_LABEL_MAP,
  TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP,
  TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA,
  TOKEN_INFORMATION_FORM_INITIAL_VALUES,
  REQUIRED_ERROR_MESSAGE,
  LISTING_FORM_PROMPT_CONTENT_MAP,
  ListingStep,
  LIQUIDITY_IN_USD_MIN_VALUE,
  HOLDERS_MIN_VALUE,
} from 'constants/listing';
import { SupportedChainId } from 'constants/index';
import {
  commitTokenInfo,
  getApplicationTokenInfo,
  getApplicationTokenList,
} from 'utils/api/application';
import { useLoading } from 'store/Provider/hooks';
import styles from './styles.module.scss';

interface ITokenInformationProps {
  symbol?: string;
  handleNextStep: () => void;
}

export default function TokenInformation({ symbol, handleNextStep }: ITokenInformationProps) {
  const [form] = Form.useForm<TTokenInformationFormValues>();
  const { isConnected, connector } = useAelf();
  const { setLoading } = useLoading();

  const [formValues, setFormValues] = useState(TOKEN_INFORMATION_FORM_INITIAL_VALUES);
  const [formValidateData, setFormValidateData] = useState(
    TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA,
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [tokenList, setTokenList] = useState<TTokenItem[]>([]);

  const getTokenList = useCallback(async () => {
    try {
      const res = await getApplicationTokenList();
      const list = (res.tokenList || []).map((item) => ({
        name: item.tokenName,
        symbol: item.symbol,
        icon: item.tokenImage,
        liquidityInUsd: item.liquidityInUsd,
        holders: item.holders,
      }));
      setTokenList(list);
      return list;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    const list = await getTokenList();
    try {
      if (symbol) {
        const res = await getApplicationTokenInfo({ symbol });
        const token = list.find((item) => item.symbol === res.symbol);
        if (token) {
          setFormValues({
            [TokenInformationFormKeys.TOKEN]: token,
            [TokenInformationFormKeys.OFFICIAL_WEBSITE]: res.officialWebsite,
            [TokenInformationFormKeys.OFFICIAL_TWITTER]: res.officialTwitter,
            [TokenInformationFormKeys.TITLE]: res.title,
            [TokenInformationFormKeys.PERSON_NAME]: res.personName,
            [TokenInformationFormKeys.TELEGRAM_HANDLER]: res.telegramHandler,
            [TokenInformationFormKeys.EMAIL]: res.email,
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getTokenList, setLoading, symbol]);

  useEffect(() => {
    init();
  }, [init]);

  const judgeIsButtonDisabled = useCallback(
    (
      currentFormData: Partial<TTokenInformationFormValues>,
      currentFormValidateData: TTokenInformationFormValidateData,
    ) => {
      const token = currentFormData[TokenInformationFormKeys.TOKEN];
      const isTokenValid =
        !!token?.liquidityInUsd &&
        parseFloat(token.liquidityInUsd) > LIQUIDITY_IN_USD_MIN_VALUE &&
        token.holders > HOLDERS_MIN_VALUE;

      const isDisabled =
        Object.values(currentFormData).some((item) => !item) ||
        Object.values(currentFormValidateData).some(
          (item) => item.validateStatus === FormValidateStatus.Error,
        ) ||
        !isTokenValid;
      setIsButtonDisabled(isDisabled);
    },
    [],
  );

  const handleFormDataChange = useCallback(
    ({
      formKey,
      value,
      validateData,
    }: {
      formKey: TokenInformationFormKeys;
      value: TTokenInformationFormValues[TokenInformationFormKeys];
      validateData: TTokenInformationFormValidateData[TokenInformationFormKeys];
    }) => {
      const newFormValues = { ...formValues, [formKey]: value };
      const newFormValidateData = {
        ...formValidateData,
        [formKey]: validateData,
      };
      setFormValues(newFormValues);
      setFormValidateData(newFormValidateData);
      judgeIsButtonDisabled(newFormValues, newFormValidateData);
    },
    [formValidateData, formValues, judgeIsButtonDisabled],
  );

  const handleSelectToken = useCallback(
    (item: TTokenItem) => {
      if (!item.symbol) {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.TOKEN,
          value: item,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: REQUIRED_ERROR_MESSAGE,
          },
        });
      } else {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.TOKEN,
          value: item,
          validateData: {
            validateStatus: FormValidateStatus.Normal,
            errorMessage: '',
          },
        });
      }
    },
    [handleFormDataChange],
  );

  const handleCommonInputChange = useCallback(
    (value: string, key: TokenInformationFormKeys) => {
      if (!value) {
        handleFormDataChange({
          formKey: key,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: REQUIRED_ERROR_MESSAGE,
          },
        });
      } else {
        handleFormDataChange({
          formKey: key,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Normal,
            errorMessage: '',
          },
        });
      }
    },
    [handleFormDataChange],
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (!value) {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.EMAIL,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: REQUIRED_ERROR_MESSAGE,
          },
        });
      } else if (!value.includes('@')) {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.EMAIL,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: 'Please enter a valid email address',
          },
        });
      } else {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.EMAIL,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Normal,
            errorMessage: '',
          },
        });
      }
    },
    [handleFormDataChange],
  );

  const handleSubmit = async () => {
    setLoading(true);
    const params = {
      symbol: formValues[TokenInformationFormKeys.TOKEN]?.symbol,
      officialWebsite: formValues[TokenInformationFormKeys.OFFICIAL_WEBSITE],
      officialTwitter: formValues[TokenInformationFormKeys.OFFICIAL_TWITTER],
      title: formValues[TokenInformationFormKeys.TITLE],
      personName: formValues[TokenInformationFormKeys.PERSON_NAME],
      telegramHandler: formValues[TokenInformationFormKeys.TELEGRAM_HANDLER],
      email: formValues[TokenInformationFormKeys.EMAIL],
    } as TCommitTokenInfoRequest;
    try {
      const isSuccess = await commitTokenInfo(params);
      if (isSuccess) {
        handleNextStep();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCommonFormItemProps = (key: TokenInformationFormKeys) => ({
    name: key,
    validateStatus: formValidateData[key].validateStatus,
    help: formValidateData[key].errorMessage,
  });

  const getCommonInputProps = (key: TokenInformationFormKeys): Partial<InputProps> => ({
    size: 'large',
    allowClear: true,
    autoComplete: 'off',
    placeholder: TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[key],
    value: formValues[key] as string,
  });

  return (
    <div className={styles['token-information']}>
      <Remind>{LISTING_FORM_PROMPT_CONTENT_MAP[ListingStep.TOKEN_INFORMATION]}</Remind>
      <Form className={styles['token-information-form']} form={form} layout="vertical">
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.TOKEN)}
          label={
            <div className={styles['token-information-form-label-wrapper']}>
              <span className={styles['token-information-form-label']}>
                {TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.TOKEN]}
              </span>
              <ConnectWalletAndAddress
                network={SupportedChainId.sideChain}
                isConnected={isConnected}
                connector={connector}
              />
            </div>
          }>
          <TokenSelect
            tokenList={tokenList}
            token={formValues[TokenInformationFormKeys.TOKEN]}
            placeholder={TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[TokenInformationFormKeys.TOKEN]}
            selectCallback={handleSelectToken}
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.OFFICIAL_WEBSITE)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.OFFICIAL_WEBSITE]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.OFFICIAL_WEBSITE)}
            onChange={(e) =>
              handleCommonInputChange(e.target.value, TokenInformationFormKeys.OFFICIAL_WEBSITE)
            }
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.OFFICIAL_TWITTER)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.OFFICIAL_TWITTER]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.OFFICIAL_TWITTER)}
            onChange={(e) =>
              handleCommonInputChange(e.target.value, TokenInformationFormKeys.OFFICIAL_TWITTER)
            }
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.TITLE)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.TITLE]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.TITLE)}
            onChange={(e) =>
              handleCommonInputChange(e.target.value, TokenInformationFormKeys.TITLE)
            }
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.PERSON_NAME)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.PERSON_NAME]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.PERSON_NAME)}
            onChange={(e) =>
              handleCommonInputChange(e.target.value, TokenInformationFormKeys.PERSON_NAME)
            }
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.TELEGRAM_HANDLER)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.TELEGRAM_HANDLER]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.TELEGRAM_HANDLER)}
            onChange={(e) =>
              handleCommonInputChange(e.target.value, TokenInformationFormKeys.TELEGRAM_HANDLER)
            }
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.EMAIL)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.EMAIL]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.EMAIL)}
            onChange={handleEmailChange}
          />
        </Form.Item>
      </Form>
      <CommonButton
        className={styles['token-information-next-button']}
        size={CommonButtonSize.Small}
        disabled={isButtonDisabled}
        onClick={handleSubmit}>
        Next
      </CommonButton>
    </div>
  );
}
