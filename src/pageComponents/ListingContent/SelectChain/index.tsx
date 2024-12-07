import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Form, Checkbox, Row, Col, Input } from 'antd';
import NetworkLogo from 'components/NetworkLogo';
import CommonButton, {
  CommonButtonProps,
  CommonButtonSize,
  CommonButtonType,
} from 'components/CommonButton';
import Remind from 'components/Remind';
import CommonTooltipSwitchModal, {
  ICommonTooltipSwitchModalRef,
} from 'components/CommonTooltipSwitchModal';
import TokenRow from '../TokenRow';
import CreationProgressModal, { ICreationProgressModalProps } from './CreationProgressModal';
import {
  TSelectChainFormValues,
  SelectChainFormKeys,
  TTokenItem,
  TSelectChainFormValidateData,
  FormValidateStatus,
  TChains,
} from 'types/listing';
import { ApplicationChainStatusEnum, TApplicationChainStatusItem } from 'types/api';
import {
  LISTING_FORM_PROMPT_CONTENT_MAP,
  ListingStep,
  SELECT_CHAIN_FORM_CHAIN_CREATED_NOT_LISTED_STATUS_LIST,
  SELECT_CHAIN_FORM_CHAIN_DISABLED_STATUS_LIST,
  SELECT_CHAIN_FORM_CHAIN_LISTED_STATUS_LIST,
  SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP,
  SELECT_CHAIN_FORM_INITIAL_VALUES,
  SELECT_CHAIN_FORM_INITIAL_VALIDATE_DATA,
  SELECT_CHAIN_FORM_LABEL_MAP,
  SELECT_CHAIN_FORM_PLACEHOLDER_MAP,
  REQUIRED_ERROR_MESSAGE,
  DEFAULT_CHAINS,
} from 'constants/listing';
import { QuestionMark16 } from 'assets/images';
import { useCommonState } from 'store/Provider/hooks';
import { useLoading } from 'store/Provider/hooks';
import {
  getApplicationTokenList,
  getApplicationChainStatusList,
  addApplicationChain,
} from 'utils/api/application';
import { formatWithCommas, parseWithCommas, parseWithStringCommas } from 'utils/format';
import styles from './styles.module.scss';

interface ISelectChainProps {
  symbol?: string;
  handleNextStep: () => void;
  handlePrevStep: () => void;
}

export default function SelectChain({ symbol, handleNextStep, handlePrevStep }: ISelectChainProps) {
  const { isMobilePX } = useCommonState();
  const { setLoading } = useLoading();
  const [form] = Form.useForm<TSelectChainFormValues>();
  const tooltipSwitchModalRef = useRef<ICommonTooltipSwitchModalRef>(null);
  const tryAgainTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState(SELECT_CHAIN_FORM_INITIAL_VALUES);
  const [formValidateData, setFormValidateData] = useState(SELECT_CHAIN_FORM_INITIAL_VALIDATE_DATA);
  const [chainListData, setChainListData] = useState<TChains>(DEFAULT_CHAINS);
  const [creationProgressModalProps, setCreationProgressModalProps] = useState<
    Pick<ICreationProgressModalProps, 'open' | 'chains'>
  >({
    open: false,
    chains: DEFAULT_CHAINS,
  });
  const [token, setToken] = useState<TTokenItem | undefined>();
  const [isShowInitialSupplyFormItem, setIsShowInitialSupplyFormItem] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const getToken = useCallback(async () => {
    try {
      const res = await getApplicationTokenList();
      const list = (res.tokenList || []).map((item) => ({
        name: item.tokenName,
        symbol: item.symbol,
        icon: item.tokenImage,
        liquidityInUsd: item.liquidityInUsd,
        holders: item.holders,
      }));
      const _token = list.find((item) => item.symbol === symbol);
      setToken(_token);
    } catch (error) {
      console.error(error);
    }
  }, [symbol]);

  const getChainList = useCallback(async () => {
    if (!symbol) return;
    try {
      const res = await getApplicationChainStatusList({ symbol });
      const listData = {
        [SelectChainFormKeys.AELF_CHAINS]: res.chainList || [],
        [SelectChainFormKeys.OTHER_CHAINS]: res.otherChainList || [],
      };
      setChainListData(listData);
    } catch (error) {
      console.error(error);
    }
  }, [symbol]);

  useEffect(() => {
    getToken();
    getChainList();
  }, [getToken, getChainList]);

  const judgeIsChainDisabled = useCallback((status: ApplicationChainStatusEnum): boolean => {
    return SELECT_CHAIN_FORM_CHAIN_DISABLED_STATUS_LIST.includes(status);
  }, []);

  const judgeIsShowInitialSupplyFormItem = useCallback((currentChains: TChains): boolean => {
    return Object.values(currentChains).some((v) =>
      v.some((v) => v.status === ApplicationChainStatusEnum.Unissued),
    );
  }, []);

  const judgeIsTokenError = useCallback(() => !token, [token]);

  const judgeIsAELFChainsError = useCallback(
    ({
      chains,
      validateStatus,
    }: {
      chains: TApplicationChainStatusItem[];
      validateStatus?: FormValidateStatus;
    }): boolean =>
      (chains.length === 0 &&
        chainListData[SelectChainFormKeys.AELF_CHAINS].every(
          (chain) => !judgeIsChainDisabled(chain.status),
        )) ||
      (!!validateStatus && validateStatus === FormValidateStatus.Error),
    [chainListData, judgeIsChainDisabled],
  );

  const judgeIsOtherChainsError = useCallback(
    ({ validateStatus }: { validateStatus?: FormValidateStatus }): boolean =>
      !!validateStatus && validateStatus === FormValidateStatus.Error,
    [],
  );

  const judgeIsInitialSupplyError = useCallback(
    ({
      _isShowInitialSupplyFormItem,
      value,
      validateStatus,
    }: {
      _isShowInitialSupplyFormItem: boolean;
      value: string;
      validateStatus?: FormValidateStatus;
    }): boolean =>
      _isShowInitialSupplyFormItem &&
      (!value || (!!validateStatus && validateStatus === FormValidateStatus.Error)),
    [],
  );

  const judgeIsButtonDisabled = useCallback(
    (
      currentFormData: TSelectChainFormValues,
      currentFormValidateData: TSelectChainFormValidateData,
      _isShowInitialSupplyFormItem: boolean,
    ) => {
      const isDisabled =
        judgeIsTokenError() ||
        judgeIsAELFChainsError({
          chains: currentFormData[SelectChainFormKeys.AELF_CHAINS],
          validateStatus: currentFormValidateData[SelectChainFormKeys.AELF_CHAINS].validateStatus,
        }) ||
        judgeIsOtherChainsError({
          validateStatus: currentFormValidateData[SelectChainFormKeys.OTHER_CHAINS].validateStatus,
        }) ||
        judgeIsInitialSupplyError({
          _isShowInitialSupplyFormItem,
          value: currentFormData[SelectChainFormKeys.INITIAL_SUPPLY],
          validateStatus:
            currentFormValidateData[SelectChainFormKeys.INITIAL_SUPPLY].validateStatus,
        });

      setIsButtonDisabled(isDisabled);
    },
    [judgeIsTokenError, judgeIsAELFChainsError, judgeIsOtherChainsError, judgeIsInitialSupplyError],
  );

  const handleFormDataChange = useCallback(
    ({
      formKey,
      value,
      validateData,
    }: {
      formKey: SelectChainFormKeys;
      value: TSelectChainFormValues[SelectChainFormKeys];
      validateData?: TSelectChainFormValidateData[SelectChainFormKeys];
    }) => {
      const newFormData = { ...formData, [formKey]: value };
      setFormData(newFormData);

      let newFormValidateData = formValidateData;
      if (validateData) {
        newFormValidateData = {
          ...newFormValidateData,
          [formKey]: validateData,
        };
        setFormValidateData(newFormValidateData);
      }

      const _isShowInitialSupplyFormItem = judgeIsShowInitialSupplyFormItem({
        [SelectChainFormKeys.AELF_CHAINS]: newFormData[SelectChainFormKeys.AELF_CHAINS],
        [SelectChainFormKeys.OTHER_CHAINS]: newFormData[SelectChainFormKeys.OTHER_CHAINS],
      });
      setIsShowInitialSupplyFormItem(_isShowInitialSupplyFormItem);

      judgeIsButtonDisabled(newFormData, newFormValidateData, _isShowInitialSupplyFormItem);
    },
    [formData, formValidateData, judgeIsButtonDisabled, judgeIsShowInitialSupplyFormItem],
  );

  const getNewChains = useCallback(
    ({
      formKey,
      value,
      checked,
    }: {
      formKey: SelectChainFormKeys;
      value: TApplicationChainStatusItem;
      checked: boolean;
    }) => {
      const preChains = (formData[formKey] as TApplicationChainStatusItem[]) || [];
      let newChains: TApplicationChainStatusItem[] = [];
      if (checked) {
        newChains = [...preChains, value];
      } else {
        newChains = preChains.filter((v) => v.chainId !== value.chainId);
      }
      return newChains;
    },
    [formData],
  );

  const handleAELFChainsChange = useCallback(
    ({ chain, checked }: { chain: TApplicationChainStatusItem; checked: boolean }) => {
      const newChains = getNewChains({
        formKey: SelectChainFormKeys.AELF_CHAINS,
        value: chain,
        checked,
      });

      let validateData = {
        validateStatus: FormValidateStatus.Normal,
        errorMessage: '',
      };
      if (judgeIsAELFChainsError({ chains: newChains })) {
        validateData = {
          validateStatus: FormValidateStatus.Error,
          errorMessage: REQUIRED_ERROR_MESSAGE,
        };
      }

      handleFormDataChange({
        formKey: SelectChainFormKeys.AELF_CHAINS,
        value: newChains,
        validateData,
      });
    },
    [getNewChains, handleFormDataChange, judgeIsAELFChainsError],
  );

  const handleOtherChainsChange = useCallback(
    ({ chain, checked }: { chain: TApplicationChainStatusItem; checked: boolean }) => {
      const newChains = getNewChains({
        formKey: SelectChainFormKeys.OTHER_CHAINS,
        value: chain,
        checked,
      });

      handleFormDataChange({
        formKey: SelectChainFormKeys.OTHER_CHAINS,
        value: newChains,
      });
    },
    [getNewChains, handleFormDataChange],
  );

  const handleInitialSupplyInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      const oldValue = formData[SelectChainFormKeys.INITIAL_SUPPLY];

      if (!value) return (e.target.value = '');

      const valueNotComma = parseWithStringCommas(value);
      const integerReg = /^[0-9]+$/;
      if (!integerReg.test(valueNotComma)) {
        return (e.target.value = oldValue);
      }

      return (e.target.value = formatWithCommas({ amount: valueNotComma }));
    },
    [formData],
  );

  const handleInitialSupplyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const valueNotComma = parseWithCommas(value);

      let validateData = {
        validateStatus: FormValidateStatus.Normal,
        errorMessage: '',
      };
      if (!valueNotComma) {
        validateData = {
          validateStatus: FormValidateStatus.Error,
          errorMessage: REQUIRED_ERROR_MESSAGE,
        };
      }

      handleFormDataChange({
        formKey: SelectChainFormKeys.INITIAL_SUPPLY,
        value: valueNotComma,
        validateData,
      });
    },
    [handleFormDataChange],
  );

  const isConnected = useMemo(() => true, []);

  const { unissuedChains, issuingChains, issuedChains } = useMemo(() => {
    const unissuedChains = {
      [SelectChainFormKeys.AELF_CHAINS]: formData[SelectChainFormKeys.AELF_CHAINS].filter(
        (chain) => chain.status === ApplicationChainStatusEnum.Unissued,
      ),
      [SelectChainFormKeys.OTHER_CHAINS]: formData[SelectChainFormKeys.OTHER_CHAINS].filter(
        (chain) => chain.status === ApplicationChainStatusEnum.Unissued,
      ),
    };
    const issuingChains = {
      [SelectChainFormKeys.AELF_CHAINS]: formData[SelectChainFormKeys.AELF_CHAINS].filter(
        (chain) => chain.status === ApplicationChainStatusEnum.Issuing,
      ),
      [SelectChainFormKeys.OTHER_CHAINS]: formData[SelectChainFormKeys.OTHER_CHAINS].filter(
        (chain) => chain.status === ApplicationChainStatusEnum.Issuing,
      ),
    };
    const issuedChains = {
      [SelectChainFormKeys.AELF_CHAINS]: formData[SelectChainFormKeys.AELF_CHAINS].filter(
        (chain) => chain.status === ApplicationChainStatusEnum.Issued,
      ),
      [SelectChainFormKeys.OTHER_CHAINS]: formData[SelectChainFormKeys.OTHER_CHAINS].filter(
        (chain) => chain.status === ApplicationChainStatusEnum.Issued,
      ),
    };

    return { unissuedChains, issuingChains, issuedChains };
  }, [formData]);

  const handleConnectWallets = useCallback(() => {
    // TODO: connect wallets
  }, []);

  const handleCreateToken = useCallback(() => {
    setCreationProgressModalProps({
      open: true,
      chains: {
        [SelectChainFormKeys.AELF_CHAINS]: [
          ...unissuedChains[SelectChainFormKeys.AELF_CHAINS],
          ...issuingChains[SelectChainFormKeys.AELF_CHAINS],
        ],
        [SelectChainFormKeys.OTHER_CHAINS]: [
          ...unissuedChains[SelectChainFormKeys.OTHER_CHAINS],
          ...issuingChains[SelectChainFormKeys.OTHER_CHAINS],
        ],
      },
    });
  }, [issuingChains, unissuedChains]);

  const handleAddChain = useCallback(async () => {
    if (!token?.symbol) return;
    setLoading(true);
    try {
      await addApplicationChain({
        chainIds: formData[SelectChainFormKeys.AELF_CHAINS].map((v) => v.chainId),
        otherChainIds: formData[SelectChainFormKeys.OTHER_CHAINS].map((v) => v.chainId),
        symbol: token.symbol,
      });
      handleNextStep();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [formData, handleNextStep, setLoading, token?.symbol]);

  const handleTryAgain = useCallback((errorChains: TChains) => {
    setCreationProgressModalProps({
      open: false,
      chains: DEFAULT_CHAINS,
    });
    if (tryAgainTimerRef.current) {
      clearTimeout(tryAgainTimerRef.current);
    }
    tryAgainTimerRef.current = setTimeout(() => {
      setCreationProgressModalProps({
        open: true,
        chains: errorChains,
      });
    }, 100);
  }, []);

  const handleCreateFinish = useCallback(async () => {
    setCreationProgressModalProps({
      open: false,
      chains: DEFAULT_CHAINS,
    });
    await handleAddChain();
  }, [handleAddChain]);

  const getActionButtonProps = useCallback(() => {
    let props: CommonButtonProps = {
      children: 'Select Chain',
    };

    if (Object.values(unissuedChains).some((v) => v.length !== 0)) {
      if (!isConnected) {
        props = {
          children: 'Connect EVM, Tron, Ton Wallets',
          onClick: handleConnectWallets,
        };
      } else {
        props = {
          children: 'Create & Issue Token',
          onClick: handleCreateToken,
        };
      }
    } else if (Object.values(issuingChains).some((v) => v.length !== 0)) {
      props = {
        children: 'Initialize Token Pool',
        onClick: handleCreateToken,
      };
    } else if (Object.values(issuedChains).some((v) => v.length !== 0)) {
      props = {
        children: 'Submit',
        onClick: handleAddChain,
      };
    }

    return props;
  }, [
    isConnected,
    issuedChains,
    issuingChains,
    unissuedChains,
    handleAddChain,
    handleConnectWallets,
    handleCreateToken,
  ]);

  const getCommonFormItemProps = (formKey: SelectChainFormKeys) => {
    return {
      name: formKey,
      validateStatus: formValidateData[formKey].validateStatus,
      help: formValidateData[formKey].errorMessage,
    };
  };

  const renderChainsFormItem = (
    formKey: SelectChainFormKeys.AELF_CHAINS | SelectChainFormKeys.OTHER_CHAINS,
  ) => {
    return (
      <Form.Item
        {...getCommonFormItemProps(formKey)}
        label={
          <div className={styles['select-chain-chains-label-wrapper']}>
            <span className={styles['select-chain-label']}>
              {SELECT_CHAIN_FORM_LABEL_MAP[formKey]}
            </span>
            <QuestionMark16 />
          </div>
        }>
        <Row gutter={[12, 8]}>
          {chainListData[formKey].map((chain) => {
            const isDisabled = judgeIsChainDisabled(chain.status);

            const checked =
              isDisabled || formData[formKey]?.some((v) => v.chainId === chain.chainId);

            let tooltip = '';
            if (SELECT_CHAIN_FORM_CHAIN_LISTED_STATUS_LIST.includes(chain.status)) {
              tooltip = SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP.LISTED;
            } else if (
              SELECT_CHAIN_FORM_CHAIN_CREATED_NOT_LISTED_STATUS_LIST.includes(chain.status)
            ) {
              tooltip = SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP.CREATED_NOT_LISTED.replace(
                '{{chainName}}',
                chain.chainId,
              );
            }

            let handleChainsChange = handleAELFChainsChange;
            if (formKey === SelectChainFormKeys.OTHER_CHAINS) {
              handleChainsChange = handleOtherChainsChange;
            }

            return (
              <Col key={chain.chainId} span={isMobilePX ? 24 : 8}>
                <CommonTooltipSwitchModal ref={tooltipSwitchModalRef} tip={tooltip}>
                  <div
                    className={clsx(
                      styles['select-chain-checkbox-item'],
                      checked && styles['select-chain-checkbox-item-checked'],
                      isDisabled && styles['select-chain-checkbox-item-disabled'],
                    )}
                    onClick={() => {
                      if (tooltip) {
                        tooltipSwitchModalRef.current?.open();
                      }
                      handleChainsChange({
                        chain,
                        checked: !checked,
                      });
                    }}>
                    <div className={styles['select-chain-checkbox-content']}>
                      <NetworkLogo network={chain.chainId} size="normal" />
                      <span className={styles['select-chain-checkbox-label']}>{chain.chainId}</span>
                    </div>
                    <Checkbox value={chain.chainId} checked={checked} disabled={isDisabled} />
                  </div>
                </CommonTooltipSwitchModal>
              </Col>
            );
          })}
        </Row>
      </Form.Item>
    );
  };

  return (
    <>
      <div className={styles['select-chain']}>
        <Remind isBorder={false}>
          {LISTING_FORM_PROMPT_CONTENT_MAP[ListingStep.SELECT_CHAIN]}
        </Remind>
        <Form className={styles['select-chain-form']} form={form} layout="vertical">
          <Form.Item label="Token">
            <div className={styles['select-chain-token-row']}>
              <TokenRow symbol={token?.symbol} name={token?.name} icon={token?.icon} />
            </div>
          </Form.Item>
          {renderChainsFormItem(SelectChainFormKeys.AELF_CHAINS)}
          {renderChainsFormItem(SelectChainFormKeys.OTHER_CHAINS)}
          {isShowInitialSupplyFormItem && (
            <Form.Item
              {...getCommonFormItemProps(SelectChainFormKeys.INITIAL_SUPPLY)}
              label={
                <div className={styles['select-chain-initial-supply-label-wrapper']}>
                  <span className={styles['select-chain-label']}>
                    {SELECT_CHAIN_FORM_LABEL_MAP[SelectChainFormKeys.INITIAL_SUPPLY]}
                  </span>
                  <span className={styles['select-chain-description']}>
                    {
                      'The token information on Ethereum, BNS Smart Chain, Arbitrum, Tron, and Ton is the same as that on the aelf chain. You only need to fill in the initial supply of the token on the other chains, and approve all signature requests.'
                    }
                  </span>
                </div>
              }>
              <Input
                autoComplete="off"
                allowClear
                placeholder={SELECT_CHAIN_FORM_PLACEHOLDER_MAP[SelectChainFormKeys.INITIAL_SUPPLY]}
                value={formData[SelectChainFormKeys.INITIAL_SUPPLY]}
                onInput={handleInitialSupplyInput}
                onChange={handleInitialSupplyChange}
              />
            </Form.Item>
          )}
        </Form>
        <div className={styles['select-chain-footer']}>
          <CommonButton
            {...getActionButtonProps()}
            size={CommonButtonSize.Small}
            disabled={isButtonDisabled}
          />
          <CommonButton
            type={CommonButtonType.Secondary}
            size={CommonButtonSize.Small}
            onClick={handlePrevStep}>
            Back
          </CommonButton>
        </div>
      </div>
      <CreationProgressModal
        {...creationProgressModalProps}
        supply={formData[SelectChainFormKeys.INITIAL_SUPPLY]}
        handleTryAgain={handleTryAgain}
        handleCreateFinish={handleCreateFinish}
      />
    </>
  );
}
