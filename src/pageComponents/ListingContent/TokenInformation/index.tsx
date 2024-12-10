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
import { useSetAelfAuthFromStorage } from 'hooks/wallet/aelfAuthToken';
import { sleep } from '@etransfer/utils';
import { useEffectOnce } from 'react-use';
import myEvents from 'utils/myEvent';
import { getListingUrl } from 'utils/listing';

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

  const getTokenInfo = useCallback(async (_symbol: string, _tokenList: TTokenItem[]) => {
    try {
      const res = await getApplicationTokenInfo({ symbol: _symbol });
      const token = _tokenList.find((item) => item.symbol === res.symbol);
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
        setFormValidateData((prev) => ({
          ...TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA,
          [TokenInformationFormKeys.TOKEN]: prev[TokenInformationFormKeys.TOKEN],
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    const list = await getTokenList();
    if (symbol) {
      await getTokenInfo(symbol, list);
    }
    setLoading(false);
  }, [getTokenInfo, getTokenList, setLoading, symbol]);
  const initRef = useRef(init);
  initRef.current = init;

  useEffectOnce(() => {
    if (!isConnected) {
      handleAelfLogin(true, init);
    } else {
      init();
    }
  });
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
        await getTokenInfo(item.symbol, tokenList);
        setLoading(false);
      }
    },
    [handleFormDataChange, router, setLoading, getTokenInfo, tokenList],
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
        handleNextStep({ symbol: params.symbol });
      }
    } catch (error) {
      console.error(error);
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
        {LISTING_FORM_PROMPT_CONTENT_MAP[ListingStep.TOKEN_INFORMATION]}
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
                network={SupportedChainId.sideChain}
                isConnected={isConnected}
                connector={connector}
                isConnectAelfDirectly={true}
                isGetAuthAfterConnect={true}
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
