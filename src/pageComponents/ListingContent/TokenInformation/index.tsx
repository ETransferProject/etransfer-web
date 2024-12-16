import { useCallback, useRef, useState } from 'react';
import { Form, Input, InputProps } from 'antd';
import { useRouter } from 'next/navigation';
import ConnectWalletAndAddress from 'components/ConnectWalletAndAddress';
import CommonButton, { CommonButtonSize } from 'components/CommonButton';
import Remind from 'components/Remind';
import TokenSelect from './TokenSelect';
import useAelf, { useAelfLogin } from 'hooks/wallet/useAelf';
import { TCommitTokenInfoRequest } from 'types/api';
import {
  TTokenInformationFormValues,
  TokenInformationFormKeys,
  TTokenInformationFormValidateData,
  FormValidateStatus,
  TTokenItem,
  TSearchParams,
  TTokenConfig,
} from 'types/listing';
import {
  TOKEN_INFORMATION_FORM_LABEL_MAP,
  TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP,
  TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA,
  TOKEN_INFORMATION_FORM_INITIAL_VALUES,
  REQUIRED_ERROR_MESSAGE,
  ListingStep,
  CONTACT_US_ROW,
} from 'constants/listing';
import { SupportedChainId } from 'constants/index';
import {
  commitTokenInfo,
  getApplicationTokenInfo,
  getApplicationTokenList,
  getApplicationTokenConfig,
} from 'utils/api/application';
import { useLoading } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { useSetAelfAuthFromStorage } from 'hooks/wallet/aelfAuthToken';
import { handleErrorMessage, sleep } from '@etransfer/utils';
import { SingleMessage } from '@etransfer/ui-react';
import { useEffectOnce } from 'react-use';
import myEvents from 'utils/myEvent';
import { getListingUrl } from 'utils/listing';
import { CONNECT_AELF_WALLET } from 'constants/wallet';
import { BUTTON_TEXT_NEXT } from 'constants/misc';

interface ITokenInformationProps {
  symbol?: string;
  handleNextStep: (params?: TSearchParams) => void;
}

export default function TokenInformation({ symbol, handleNextStep }: ITokenInformationProps) {
  const [form] = Form.useForm<TTokenInformationFormValues>();
  const { isConnected, connector } = useAelf();
  const handleAelfLogin = useAelfLogin();
  const setAelfAuthFromStorage = useSetAelfAuthFromStorage();
  const { setLoading } = useLoading();
  const router = useRouter();

  const [formValues, setFormValues] = useState(TOKEN_INFORMATION_FORM_INITIAL_VALUES);
  const [formValidateData, setFormValidateData] = useState(
    TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA,
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [tokenList, setTokenList] = useState<TTokenItem[]>([]);
  const [tokenConfig, setTokenConfig] = useState<TTokenConfig | undefined>();

  const judgeIsButtonDisabled = useCallback(
    (
      currentFormData: Partial<TTokenInformationFormValues>,
      currentFormValidateData: TTokenInformationFormValidateData,
      currentTokenConfig?: TTokenConfig,
    ) => {
      const token = currentFormData[TokenInformationFormKeys.TOKEN];
      const isTokenValid =
        !!token?.liquidityInUsd &&
        !!currentTokenConfig?.liquidityInUsd &&
        parseFloat(token.liquidityInUsd) > parseFloat(currentTokenConfig.liquidityInUsd) &&
        currentTokenConfig?.holders !== undefined &&
        token.holders > currentTokenConfig.holders;

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

  const reset = useCallback(() => {
    setFormValues(TOKEN_INFORMATION_FORM_INITIAL_VALUES);
    setFormValidateData(TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA);
    setIsButtonDisabled(true);
    setTokenList([]);
  }, []);

  const getTokenList = useCallback(async () => {
    try {
      await setAelfAuthFromStorage();
      await sleep(500);
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
  }, [setAelfAuthFromStorage]);

  const getTokenConfig = useCallback(async (_symbol: string) => {
    try {
      const config = await getApplicationTokenConfig({ symbol: _symbol });
      setTokenConfig(config);
      return config;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }, []);

  const getTokenInfo = useCallback(
    async (_symbol: string, _tokenList: TTokenItem[], _tokenConfig: TTokenConfig) => {
      try {
        const res = await getApplicationTokenInfo({ symbol: _symbol });
        const token = _tokenList.find((item) => item.symbol === _symbol);
        if (token) {
          const newFormValues = {
            ...TOKEN_INFORMATION_FORM_INITIAL_VALUES,
            [TokenInformationFormKeys.TOKEN]: token,
          };
          if (res) {
            newFormValues[TokenInformationFormKeys.OFFICIAL_WEBSITE] = res.officialWebsite;
            newFormValues[TokenInformationFormKeys.OFFICIAL_TWITTER] = res.officialTwitter;
            newFormValues[TokenInformationFormKeys.TITLE] = res.title;
            newFormValues[TokenInformationFormKeys.PERSON_NAME] = res.personName;
            newFormValues[TokenInformationFormKeys.TELEGRAM_HANDLER] = res.telegramHandler;
            newFormValues[TokenInformationFormKeys.EMAIL] = res.email;
          }
          const newFormValidateData = {
            ...TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA,
            [TokenInformationFormKeys.TOKEN]: formValidateData[TokenInformationFormKeys.TOKEN],
          };
          setFormValues(newFormValues);
          setFormValidateData(newFormValidateData);
          judgeIsButtonDisabled(newFormValues, newFormValidateData, _tokenConfig);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [formValidateData, judgeIsButtonDisabled],
  );

  const init = useCallback(async () => {
    setLoading(true);
    const list = await getTokenList();
    if (symbol) {
      const config = await getTokenConfig(symbol);
      if (config) {
        await getTokenInfo(symbol, list, config);
      }
    }
    setLoading(false);
  }, [getTokenConfig, getTokenInfo, getTokenList, setLoading, symbol]);
  const initRef = useRef(init);
  initRef.current = init;

  useEffectOnce(() => {
    if (!isConnected) {
      handleAelfLogin(true, init);
    } else {
      init();
    }
  });

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
      judgeIsButtonDisabled(newFormValues, newFormValidateData, tokenConfig);
    },
    [formValidateData, formValues, judgeIsButtonDisabled, tokenConfig],
  );

  const handleSelectToken = useCallback(
    async (item: TTokenItem) => {
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
        setLoading(true);
        handleFormDataChange({
          formKey: TokenInformationFormKeys.TOKEN,
          value: item,
          validateData: {
            validateStatus: FormValidateStatus.Normal,
            errorMessage: '',
          },
        });
        router.replace(getListingUrl(ListingStep.TOKEN_INFORMATION, { symbol: item.symbol }));
        const config = await getTokenConfig(item.symbol);
        if (config) {
          await getTokenInfo(item.symbol, tokenList, config);
        }
        setLoading(false);
      }
    },
    [handleFormDataChange, router, setLoading, getTokenConfig, getTokenInfo, tokenList],
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

  const handleUrlChange = useCallback(
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
      } else if (!value.startsWith('https://')) {
        handleFormDataChange({
          formKey: key,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: 'Please enter a valid URL',
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
    (value: string) => {
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
        handleNextStep({ symbol: params.symbol });
      }
    } catch (error) {
      SingleMessage.error(handleErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getCommonFormItemProps = (key: TokenInformationFormKeys) => ({
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

  const initForLogout = useCallback(async () => {
    reset();
  }, [reset]);
  const initLogoutRef = useRef(initForLogout);
  initLogoutRef.current = initForLogout;

  const initForReLogin = useCallback(async () => {
    await init();
  }, [init]);
  const initForReLoginRef = useRef(initForReLogin);
  initForReLoginRef.current = initForReLogin;

  useEffectOnce(() => {
    // log in
    const { remove: removeLoginSuccess } = myEvents.LoginSuccess.addListener(() =>
      initForReLoginRef.current(),
    );
    // log out \ exit
    const { remove: removeLogoutSuccess } = myEvents.LogoutSuccess.addListener(() => {
      initLogoutRef.current();
    });

    return () => {
      removeLoginSuccess();
      removeLogoutSuccess();
    };
  });

  return (
    <div className={styles['token-information']}>
      <Remind isBorder={false}>
        <p>{'• Only the current token owner on the aelf chain can apply.'}</p>
        {tokenConfig && (
          <p>{`• The token must meet the requirements of Liquidity > $${tokenConfig.liquidityInUsd} and Holders > ${tokenConfig.holders}.`}</p>
        )}
        <p>{CONTACT_US_ROW}</p>
      </Remind>
      <Form className={styles['token-information-form']} form={form} layout="vertical">
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.TOKEN)}
          label={
            <div className={styles['token-information-form-label-wrapper']}>
              <span className={styles['token-information-form-label']}>
                {TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.TOKEN]}
              </span>
              <ConnectWalletAndAddress
                network={SupportedChainId.mainChain}
                isConnected={isConnected}
                connector={connector}
                isConnectAelfDirectly={true}
                isGetAuthAfterConnect={true}
              />
            </div>
          }>
          <TokenSelect
            tokenConfig={tokenConfig}
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
              handleUrlChange(e.target.value, TokenInformationFormKeys.OFFICIAL_WEBSITE)
            }
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.OFFICIAL_TWITTER)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.OFFICIAL_TWITTER]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.OFFICIAL_TWITTER)}
            onChange={(e) =>
              handleUrlChange(e.target.value, TokenInformationFormKeys.OFFICIAL_TWITTER)
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
            onChange={(e) => handleEmailChange(e.target.value)}
          />
        </Form.Item>
      </Form>
      {isConnected ? (
        <CommonButton
          className={styles['token-information-footer-button']}
          size={CommonButtonSize.Small}
          disabled={isButtonDisabled}
          onClick={handleSubmit}>
          {BUTTON_TEXT_NEXT}
        </CommonButton>
      ) : (
        <CommonButton
          className={styles['token-information-footer-button']}
          size={CommonButtonSize.Small}
          onClick={() => handleAelfLogin(true, init)}>
          {CONNECT_AELF_WALLET}
        </CommonButton>
      )}
    </div>
  );
}
