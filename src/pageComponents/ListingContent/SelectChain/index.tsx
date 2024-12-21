import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { SingleMessage } from '@etransfer/ui-react';
import { Form, Checkbox, Row, Col, Input } from 'antd';
import NetworkLogo from 'components/NetworkLogo';
import CommonButton, {
  CommonButtonProps,
  CommonButtonSize,
  CommonButtonType,
} from 'components/CommonButton';
import CommonTooltipSwitchModal, {
  ICommonTooltipSwitchModalRef,
} from 'components/CommonTooltipSwitchModal';
import TokenRow from '../TokenRow';
import ListingTip from '../ListingTip';
import CreationProgressModal, { ICreationProgressModalProps } from './CreationProgressModal';
import {
  TSelectChainFormValues,
  SelectChainFormKeys,
  TTokenItem,
  TSelectChainFormValidateData,
  FormValidateStatus,
  TChains,
  TSearchParams,
} from 'types/listing';
import { ApplicationChainStatusEnum, TApplicationChainStatusItem } from 'types/api';
import {
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
  WALLET_CONNECTION_REQUIRED,
  ListingStep,
  LISTING_STEP_ITEMS,
} from 'constants/listing';
import { useCommonState } from 'store/Provider/hooks';
import { useLoading } from 'store/Provider/hooks';
import {
  getApplicationTokenList,
  getApplicationChainStatusList,
  addApplicationChain,
  getApplicationTokenInfo,
} from 'utils/api/application';
import {
  formatListWithAnd,
  formatWithCommas,
  parseWithCommas,
  parseWithStringCommas,
} from 'utils/format';
import styles from './styles.module.scss';
import { useEffectOnce } from 'react-use';
import myEvents from 'utils/myEvent';
import { useSetAelfAuthFromStorage } from 'hooks/wallet/aelfAuthToken';
import useAelf from 'hooks/wallet/useAelf';
import useEVM from 'hooks/wallet/useEVM';
import useSolana from 'hooks/wallet/useSolana';
import useTON from 'hooks/wallet/useTON';
import useTRON from 'hooks/wallet/useTRON';
import { handleErrorMessage, sleep } from '@etransfer/utils';
import EmptyDataBox from 'components/EmptyDataBox';
import { CONNECT_WALLET, MY_WALLET } from 'constants/wallet';
import ConnectWalletModal from 'components/Header/LoginAndProfile/ConnectWalletModal';
import { WalletTypeEnum } from 'context/Wallet/types';
import { isEVMChain, isSolanaChain, isTONChain, isTRONChain } from 'utils/wallet';
import { BUTTON_TEXT_BACK, SELECT_CHAIN } from 'constants/misc';
import { getListingUrl } from 'utils/listing';
import { LANG_MAX, ZERO } from 'constants/calculate';

interface ISelectChainProps {
  symbol?: string;
  handleNextStep: (params?: TSearchParams) => void;
  handlePrevStep: (params?: TSearchParams) => void;
}

const DEFAULT_CONNECT_WALLET_MODAL_PROPS: {
  open: boolean;
  allowList: WalletTypeEnum[];
} = {
  open: false,
  allowList: [],
};

const REJECTED_CHAIN_DISABLED_HOURS = 48;

export default function SelectChain({ symbol, handleNextStep, handlePrevStep }: ISelectChainProps) {
  const router = useRouter();
  const { isMobilePX } = useCommonState();
  const { setLoading } = useLoading();
  const { isConnected: isAelfConnected } = useAelf();
  const { isConnected: isEVMConnected } = useEVM();
  const { isConnected: isSolanaConnected } = useSolana();
  const { isConnected: isTONConnected } = useTON();
  const { isConnected: isTRONConnected } = useTRON();
  const setAelfAuthFromStorage = useSetAelfAuthFromStorage();
  const [form] = Form.useForm<TSelectChainFormValues>();
  const tooltipSwitchModalsRef = useRef<Record<string, ICommonTooltipSwitchModalRef | null>>({});

  const [formData, setFormData] = useState(SELECT_CHAIN_FORM_INITIAL_VALUES);
  const [formValidateData, setFormValidateData] = useState(SELECT_CHAIN_FORM_INITIAL_VALIDATE_DATA);
  const [chainListData, setChainListData] = useState<TChains>(DEFAULT_CHAINS);
  const [creationProgressModalProps, setCreationProgressModalProps] = useState<
    Pick<ICreationProgressModalProps, 'open' | 'chains'>
  >({
    open: false,
    chains: [],
  });
  const [token, setToken] = useState<TTokenItem | undefined>();
  const [isShowInitialSupplyFormItem, setIsShowInitialSupplyFormItem] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [connectWalletModalProps, setConnectWalletModalProps] = useState(
    DEFAULT_CONNECT_WALLET_MODAL_PROPS,
  );

  const handleBackStep = useCallback(() => {
    handlePrevStep({ symbol });
  }, [handlePrevStep, symbol]);

  const getToken = useCallback(async () => {
    if (!symbol) return;
    const res = await getApplicationTokenList();
    const list = (res.tokenList || []).map((item) => ({
      name: item.tokenName,
      symbol: item.symbol,
      icon: item.tokenImage,
      liquidityInUsd: item.liquidityInUsd,
      holders: item.holders,
    }));
    const _token = list.find((item) => item.symbol === symbol);
    if (_token) {
      const tokenInfo = await getApplicationTokenInfo({ symbol });
      if (tokenInfo && tokenInfo.symbol) {
        setToken(_token);
      } else {
        throw new Error('Failed to get token info');
      }
    } else {
      throw new Error('Token not found');
    }
  }, [symbol]);

  const getChainList = useCallback(async () => {
    if (!symbol) return;
    const res = await getApplicationChainStatusList({ symbol });
    const listData = {
      [SelectChainFormKeys.AELF_CHAINS]: res.chainList || [],
      [SelectChainFormKeys.OTHER_CHAINS]: res.otherChainList || [],
    };
    setChainListData(listData);
  }, [symbol]);

  const getRejectedChainDisabledRemainingHours = useCallback((rejectedTime: number): number => {
    const elapsedHours = moment().diff(moment(rejectedTime), 'hours', true);
    const remainingHours = Math.ceil(REJECTED_CHAIN_DISABLED_HOURS - elapsedHours);
    return remainingHours;
  }, []);

  const judgeIsRejectedChainDisabled = useCallback(
    (rejectedTime?: number): boolean => {
      return !!(rejectedTime && getRejectedChainDisabledRemainingHours(rejectedTime) > 0);
    },
    [getRejectedChainDisabledRemainingHours],
  );

  const judgeIsChainDisabled = useCallback(
    (status: ApplicationChainStatusEnum, rejectedTime?: number): boolean => {
      return (
        SELECT_CHAIN_FORM_CHAIN_DISABLED_STATUS_LIST.includes(status) ||
        (status === ApplicationChainStatusEnum.Rejected &&
          judgeIsRejectedChainDisabled(rejectedTime))
      );
    },
    [judgeIsRejectedChainDisabled],
  );

  const hasDisabledAELFChain = useMemo(
    () =>
      chainListData[SelectChainFormKeys.AELF_CHAINS].some((chain) =>
        judgeIsChainDisabled(chain.status),
      ),
    [chainListData, judgeIsChainDisabled],
  );

  const hasDisabledOtherChain = useMemo(
    () =>
      chainListData[SelectChainFormKeys.OTHER_CHAINS].some((chain) =>
        judgeIsChainDisabled(chain.status, chain.rejectedTime),
      ),
    [chainListData, judgeIsChainDisabled],
  );

  const judgeIsShowInitialSupplyFormItem = useCallback(
    (currentOtherChains: TApplicationChainStatusItem[]): boolean => {
      return currentOtherChains.some((v) => v.status === ApplicationChainStatusEnum.Unissued);
    },
    [],
  );

  const judgeIsTokenError = useCallback(() => !token, [token]);

  const judgeIsChainsError = useCallback(
    ({
      aelfChains,
      otherChains,
    }: {
      aelfChains: TApplicationChainStatusItem[];
      otherChains: TApplicationChainStatusItem[];
    }): boolean => {
      const isAelfSelected = hasDisabledAELFChain || aelfChains.length > 0;
      const isOtherSelected = hasDisabledOtherChain || otherChains.length > 0;
      const hasValue = aelfChains.length > 0 || otherChains.length > 0;

      if (isAelfSelected && isOtherSelected && hasValue) {
        return false;
      }
      return true;
    },
    [hasDisabledAELFChain, hasDisabledOtherChain],
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

  const unconnectedWallets = useMemo(() => {
    const list: WalletTypeEnum[] = [];
    formData[SelectChainFormKeys.OTHER_CHAINS].forEach((item) => {
      if (isEVMChain(item.chainId) && !isEVMConnected) {
        list.push(WalletTypeEnum.EVM);
      } else if (isSolanaChain(item.chainId) && !isSolanaConnected) {
        list.push(WalletTypeEnum.SOL);
      } else if (isTRONChain(item.chainId) && !isTRONConnected) {
        list.push(WalletTypeEnum.TRON);
      } else if (isTONChain(item.chainId) && !isTONConnected) {
        list.push(WalletTypeEnum.TON);
      }
    });
    return [...new Set(list)];
  }, [formData, isEVMConnected, isSolanaConnected, isTRONConnected, isTONConnected]);

  const judgeIsButtonDisabled = useCallback(() => {
    const isDisabled =
      (judgeIsTokenError() ||
        judgeIsChainsError({
          aelfChains: formData[SelectChainFormKeys.AELF_CHAINS],
          otherChains: formData[SelectChainFormKeys.OTHER_CHAINS],
        }) ||
        judgeIsInitialSupplyError({
          _isShowInitialSupplyFormItem: isShowInitialSupplyFormItem,
          value: formData[SelectChainFormKeys.INITIAL_SUPPLY],
          validateStatus: formValidateData[SelectChainFormKeys.INITIAL_SUPPLY].validateStatus,
        })) &&
      unconnectedWallets.length === 0;

    setIsButtonDisabled(isDisabled);
  }, [
    unconnectedWallets,
    formData,
    judgeIsTokenError,
    judgeIsChainsError,
    judgeIsInitialSupplyError,
    isShowInitialSupplyFormItem,
    formValidateData,
  ]);

  useEffect(() => {
    judgeIsButtonDisabled();
  }, [judgeIsButtonDisabled]);

  const handleFormDataChange = useCallback(
    ({
      formKey,
      value,
      validateData,
    }: {
      formKey: SelectChainFormKeys;
      value: TSelectChainFormValues[SelectChainFormKeys];
      validateData?: TSelectChainFormValidateData[SelectChainFormKeys.INITIAL_SUPPLY];
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

      const _isShowInitialSupplyFormItem = judgeIsShowInitialSupplyFormItem(
        newFormData[SelectChainFormKeys.OTHER_CHAINS],
      );
      setIsShowInitialSupplyFormItem(_isShowInitialSupplyFormItem);
    },
    [formData, formValidateData, judgeIsShowInitialSupplyFormItem],
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

      handleFormDataChange({
        formKey: SelectChainFormKeys.AELF_CHAINS,
        value: newChains,
      });
    },
    [getNewChains, handleFormDataChange],
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

      if (!valueNotComma) {
        handleFormDataChange({
          formKey: SelectChainFormKeys.INITIAL_SUPPLY,
          value: '',
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: REQUIRED_ERROR_MESSAGE,
          },
        });
      } else if (ZERO.plus(valueNotComma).lte(LANG_MAX)) {
        handleFormDataChange({
          formKey: SelectChainFormKeys.INITIAL_SUPPLY,
          value: valueNotComma,
          validateData: {
            validateStatus: FormValidateStatus.Normal,
            errorMessage: '',
          },
        });
      }
    },
    [handleFormDataChange],
  );

  const { unissuedOtherChains, issuingOtherChains, issuedChains, rejectedEnabledOtherChains } =
    useMemo(() => {
      const unissuedOtherChains = formData[SelectChainFormKeys.OTHER_CHAINS].filter(
        (chain) => chain.status === ApplicationChainStatusEnum.Unissued,
      );
      const issuingOtherChains = formData[SelectChainFormKeys.OTHER_CHAINS].filter(
        (chain) => chain.status === ApplicationChainStatusEnum.Issuing,
      );
      const issuedChains = {
        [SelectChainFormKeys.AELF_CHAINS]: formData[SelectChainFormKeys.AELF_CHAINS].filter(
          (chain) => chain.status === ApplicationChainStatusEnum.Issued,
        ),
        [SelectChainFormKeys.OTHER_CHAINS]: formData[SelectChainFormKeys.OTHER_CHAINS].filter(
          (chain) => chain.status === ApplicationChainStatusEnum.Issued,
        ),
      };
      const rejectedEnabledOtherChains = formData[SelectChainFormKeys.OTHER_CHAINS].filter(
        (chain) => chain.status === ApplicationChainStatusEnum.Rejected,
      );
      return { unissuedOtherChains, issuingOtherChains, issuedChains, rejectedEnabledOtherChains };
    }, [formData]);

  const handleConnectWallets = useCallback(() => {
    setConnectWalletModalProps({
      open: true,
      allowList: unconnectedWallets,
    });
  }, [unconnectedWallets]);

  const handleCreateToken = useCallback(() => {
    setCreationProgressModalProps({
      open: true,
      chains: [...unissuedOtherChains, ...issuingOtherChains],
    });
  }, [issuingOtherChains, unissuedOtherChains]);

  const handleJump = useCallback(
    ({ networksString, id, _symbol }: { networksString: string; id?: string; _symbol: string }) => {
      if (
        id &&
        hasDisabledAELFChain &&
        formData[SelectChainFormKeys.AELF_CHAINS].length !== 0 &&
        formData[SelectChainFormKeys.OTHER_CHAINS].length === 0
      ) {
        const replaceUrl = getListingUrl(ListingStep.INITIALIZE_LIQUIDITY_POOL, {
          symbol: _symbol,
          id,
        });
        router.replace(replaceUrl);
      } else {
        handleNextStep({ networks: networksString });
      }
    },
    [formData, hasDisabledAELFChain, router, handleNextStep],
  );

  const handleAddChain = useCallback(
    async ({ errorOtherChainIds }: { errorOtherChainIds?: string[] } = {}) => {
      if (!token?.symbol) return;
      setLoading(true);
      try {
        const data = await addApplicationChain({
          chainIds: formData[SelectChainFormKeys.AELF_CHAINS].map((v) => v.chainId),
          otherChainIds: formData[SelectChainFormKeys.OTHER_CHAINS]
            .filter((v) => !errorOtherChainIds?.includes(v.chainId))
            .map((v) => v.chainId),
          symbol: token.symbol,
        });
        if (!data?.chainList && !data?.otherChainList) {
          throw new Error('Failed to add chain');
        }
        const aelfNetworks = formData[SelectChainFormKeys.AELF_CHAINS]
          .filter((item) => data?.chainList?.some((v) => v.chainId === item.chainId))
          .map((v) => ({
            name: v.chainName,
          }));
        const otherNetworks = formData[SelectChainFormKeys.OTHER_CHAINS]
          .filter((item) => data?.otherChainList?.some((v) => v.chainId === item.chainId))
          .map((v) => ({
            name: v.chainName,
          }));
        const networks = [...aelfNetworks, ...otherNetworks];
        const networksString = JSON.stringify(networks);
        const id = data?.chainList?.[0]?.id;
        handleJump({ networksString, id, _symbol: token.symbol });
      } catch (error) {
        SingleMessage.error(handleErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [formData, handleJump, setLoading, token?.symbol],
  );

  const handleCreationProgressModalClose = useCallback(() => {
    setCreationProgressModalProps({
      open: false,
      chains: [],
    });
  }, []);

  const handleCreateFinish = useCallback(
    async ({ errorOtherChainIds }: { errorOtherChainIds?: string[] } = {}) => {
      handleCreationProgressModalClose();
      await handleAddChain({ errorOtherChainIds });
    },
    [handleAddChain, handleCreationProgressModalClose],
  );

  const getActionButtonProps = useCallback(() => {
    let props: CommonButtonProps = {
      children: SELECT_CHAIN,
    };

    if (unissuedOtherChains.length !== 0 || issuingOtherChains.length !== 0) {
      if (unconnectedWallets.length > 0) {
        props = {
          children: `Connect ${unconnectedWallets.join(', ')} Wallet${
            unconnectedWallets.length > 1 ? 's' : ''
          }`,
          onClick: handleConnectWallets,
        };
      } else {
        props = {
          children: 'Create & Issue Token',
          onClick: handleCreateToken,
        };
      }
    } else if (
      formData[SelectChainFormKeys.AELF_CHAINS].length !== 0 ||
      rejectedEnabledOtherChains.length !== 0 ||
      Object.values(issuedChains).some((v) => v.length !== 0)
    ) {
      props = {
        children: 'Submit',
        onClick: () => handleAddChain(),
      };
    }

    return props;
  }, [
    unissuedOtherChains.length,
    issuingOtherChains.length,
    rejectedEnabledOtherChains.length,
    issuedChains,
    formData,
    unconnectedWallets,
    handleConnectWallets,
    handleCreateToken,
    handleAddChain,
  ]);

  const init = useCallback(async () => {
    try {
      setLoading(true);
      await setAelfAuthFromStorage();
      await sleep(500);

      await getToken();
      await getChainList();
    } catch (error) {
      console.log('SelectChain init', error);
      handleBackStep();
    } finally {
      setLoading(false);
    }
  }, [getChainList, getToken, handleBackStep, setAelfAuthFromStorage, setLoading]);

  const connectAndInit = useCallback(() => {
    if (!isAelfConnected || !symbol) {
      handleBackStep();
    } else {
      init();
    }
  }, [handleBackStep, init, isAelfConnected, symbol]);
  const connectAndInitRef = useRef(connectAndInit);
  connectAndInitRef.current = connectAndInit;
  const connectAndInitSleep = useCallback(async () => {
    setLoading(true);
    // Delay 3s to determine the login status, because the login data is acquired slowly, to prevent the login pop-up window from being displayed first and then automatically logging in successfully later.
    await sleep(3000);
    connectAndInitRef.current();
  }, [setLoading]);
  useEffectOnce(() => {
    connectAndInitSleep();
  });

  const initForLogout = useCallback(async () => {
    setLoading(true);
    handleBackStep();
  }, [handleBackStep, setLoading]);
  const initLogoutRef = useRef(initForLogout);
  initLogoutRef.current = initForLogout;

  useEffectOnce(() => {
    // log out \ exit
    const { remove: removeLogoutSuccess } = myEvents.LogoutSuccess.addListener(() => {
      initLogoutRef.current();
    });

    return () => {
      removeLogoutSuccess();
    };
  });

  const renderChainsFormItem = (
    formKey: SelectChainFormKeys.AELF_CHAINS | SelectChainFormKeys.OTHER_CHAINS,
  ) => {
    return (
      <Form.Item label={SELECT_CHAIN_FORM_LABEL_MAP[formKey]}>
        <Row gutter={[12, 8]}>
          {chainListData[formKey].map((chain) => {
            const isDisabled = judgeIsChainDisabled(chain.status, chain.rejectedTime);

            const checked =
              isDisabled || formData[formKey]?.some((v) => v.chainId === chain.chainId);

            let tooltip = '';
            if (isDisabled) {
              if (SELECT_CHAIN_FORM_CHAIN_LISTED_STATUS_LIST.includes(chain.status)) {
                tooltip = SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP.LISTED;
              } else if (
                SELECT_CHAIN_FORM_CHAIN_CREATED_NOT_LISTED_STATUS_LIST.includes(chain.status)
              ) {
                tooltip = SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP.CREATED_NOT_LISTED.replace(
                  '{{chainName}}',
                  chain.chainName,
                );
              } else if (
                chain.status === ApplicationChainStatusEnum.Rejected &&
                chain.rejectedTime
              ) {
                tooltip = SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP.REJECTED.replace(
                  '{{hours}}',
                  getRejectedChainDisabledRemainingHours(chain.rejectedTime).toString(),
                );
              }
            }

            let handleChainsChange = handleAELFChainsChange;
            if (formKey === SelectChainFormKeys.OTHER_CHAINS) {
              handleChainsChange = handleOtherChainsChange;
            }

            return (
              <Col key={chain.chainId} span={isMobilePX ? 24 : 8}>
                <CommonTooltipSwitchModal
                  ref={(ref) => {
                    tooltipSwitchModalsRef.current[chain.chainId] = ref;
                  }}
                  tip={tooltip}>
                  <div
                    className={clsx(
                      styles['select-chain-checkbox-item'],
                      checked && styles['select-chain-checkbox-item-checked'],
                      isDisabled && styles['select-chain-checkbox-item-disabled'],
                    )}
                    onClick={() => {
                      if (tooltip) {
                        tooltipSwitchModalsRef.current[chain.chainId]?.open();
                      }
                      handleChainsChange({
                        chain,
                        checked: !checked,
                      });
                    }}>
                    <div className={styles['select-chain-checkbox-content']}>
                      <NetworkLogo network={chain.chainId} size="normal" />
                      <span className={styles['select-chain-checkbox-label']}>
                        {chain.chainName}
                      </span>
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
        <div className={styles['select-chain-title-wrapper']}>
          <span className={styles['select-chain-title']}>
            {LISTING_STEP_ITEMS[ListingStep.SELECT_CHAIN].title}
          </span>
          <ListingTip
            title="Chain Guide"
            tip={
              <>
                <p>Tips:</p>
                <ul className="list-style-decimal">
                  <li>Please select at least one aelf chain and one other chain.</li>
                  <li>
                    You can select multiple chains simultaneously, and Transfers will be supported
                    between any two selected chains.
                  </li>
                </ul>
              </>
            }
          />
        </div>
        {isAelfConnected ? (
          <Form className={styles['select-chain-form']} form={form} layout="vertical">
            <Form.Item label="Token">
              {token && (
                <div className={styles['select-chain-token-row']}>
                  <TokenRow symbol={token.symbol} name={token.name} icon={token.icon} />
                </div>
              )}
            </Form.Item>
            {renderChainsFormItem(SelectChainFormKeys.AELF_CHAINS)}
            {renderChainsFormItem(SelectChainFormKeys.OTHER_CHAINS)}
            {isShowInitialSupplyFormItem && (
              <Form.Item
                validateStatus={formValidateData[SelectChainFormKeys.INITIAL_SUPPLY].validateStatus}
                help={formValidateData[SelectChainFormKeys.INITIAL_SUPPLY].errorMessage}
                label={
                  <div className={styles['select-chain-initial-supply-label-wrapper']}>
                    <span className={styles['select-chain-label']}>
                      {SELECT_CHAIN_FORM_LABEL_MAP[SelectChainFormKeys.INITIAL_SUPPLY]}
                    </span>
                    <div className={styles['select-chain-description']}>
                      <p>
                        {`The token information on ${formatListWithAnd(
                          formData[SelectChainFormKeys.OTHER_CHAINS].map((v) => v.chainName),
                        )} is the same as that on the aelf chain.`}
                      </p>
                      <p>
                        {
                          'You only need to fill in the issuance amount of the token on the other chains.'
                        }
                      </p>
                    </div>
                  </div>
                }>
                <Input
                  autoComplete="off"
                  allowClear
                  placeholder={
                    SELECT_CHAIN_FORM_PLACEHOLDER_MAP[SelectChainFormKeys.INITIAL_SUPPLY]
                  }
                  value={formData[SelectChainFormKeys.INITIAL_SUPPLY]}
                  onInput={handleInitialSupplyInput}
                  onChange={handleInitialSupplyChange}
                />
              </Form.Item>
            )}
          </Form>
        ) : (
          <EmptyDataBox emptyText={WALLET_CONNECTION_REQUIRED} />
        )}
        <div className={styles['select-chain-footer']}>
          {isAelfConnected && (
            <CommonButton
              {...getActionButtonProps()}
              size={CommonButtonSize.Small}
              disabled={isButtonDisabled}
            />
          )}
          <CommonButton
            type={CommonButtonType.Secondary}
            size={CommonButtonSize.Small}
            onClick={handleBackStep}>
            {BUTTON_TEXT_BACK}
          </CommonButton>
        </div>
      </div>
      <CreationProgressModal
        {...creationProgressModalProps}
        isFirstTimeCreation={!hasDisabledAELFChain || !hasDisabledOtherChain}
        isSelectAelfChains={formData[SelectChainFormKeys.AELF_CHAINS].length !== 0}
        supply={formData[SelectChainFormKeys.INITIAL_SUPPLY]}
        handleCreateFinish={handleCreateFinish}
        handleClose={handleCreationProgressModalClose}
      />
      <ConnectWalletModal
        {...connectWalletModalProps}
        title={
          connectWalletModalProps.allowList.length === unconnectedWallets.length
            ? CONNECT_WALLET
            : MY_WALLET
        }
        onCancel={() => setConnectWalletModalProps(DEFAULT_CONNECT_WALLET_MODAL_PROPS)}
      />
    </>
  );
}
