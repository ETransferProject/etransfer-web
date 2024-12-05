import { useCallback, useState } from 'react';
import clsx from 'clsx';
import { Form, Checkbox, Row, Col, Input } from 'antd';
import NetworkLogo from 'components/NetworkLogo';
import CommonTooltip from 'components/CommonTooltip';
import CommonButton, { CommonButtonSize, CommonButtonType } from 'components/CommonButton';
import TokenRow from '../TokenRow';
import CreationProgressModal from './CreationProgressModal';
import { TSelectChainFormValues, SelectChainFormKeys } from 'types/listing';
import { SELECT_CHAIN_FORM_LABEL_MAP, SELECT_CHAIN_FORM_PLACEHOLDER_MAP } from 'constants/listing';
import { SupportedChainId, CHAIN_NAME_ENUM } from 'constants/index';
import { QuestionMark16 } from 'assets/images';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';

const AELF_CHAINS = [
  {
    icon: <NetworkLogo network={SupportedChainId.mainChain} size="normal" />,
    label: CHAIN_NAME_ENUM.MainChain,
    value: SupportedChainId.mainChain,
  },
  {
    icon: <NetworkLogo network={SupportedChainId.sideChain} size="normal" />,
    label: CHAIN_NAME_ENUM.SideChain,
    value: SupportedChainId.sideChain,
    disabled: true,
    tooltip: 'The token has been created on TRON.',
  },
];

export default function SelectChain() {
  const { isMobile, isMobilePX } = useCommonState();
  const [form] = Form.useForm<TSelectChainFormValues>();
  const [chains, setChains] = useState<{ [key: string]: string[] }>({
    [SelectChainFormKeys.AELF_CHAINS]: [],
    [SelectChainFormKeys.OTHER_CHAINS]: [],
  });
  const [creationProgressModalOpen, setCreationProgressModalOpen] = useState(false);

  const handleChainsChange = useCallback(
    ({
      formKey,
      value,
      checked,
    }: {
      formKey: SelectChainFormKeys;
      value: string;
      checked: boolean;
    }) => {
      const preChains = form.getFieldValue(formKey) || [];
      let newChains = [];
      if (checked) {
        newChains = [...preChains, value];
      } else {
        newChains = preChains.filter((v: string) => v !== value);
      }
      form.setFieldValue(formKey, newChains);
      setChains((prev) => ({ ...prev, [formKey]: newChains }));
    },
    [form],
  );

  const renderChainsFormItem = (formKey: SelectChainFormKeys) => {
    return (
      <Form.Item
        name={formKey}
        label={
          <div className={styles['select-chain-chains-label-wrapper']}>
            <span className={styles['select-chain-label']}>
              {SELECT_CHAIN_FORM_LABEL_MAP[formKey]}
            </span>
            <QuestionMark16 />
          </div>
        }>
        <Row gutter={[12, 8]}>
          {AELF_CHAINS.map((chain) => {
            const checked = chain.disabled || chains[formKey]?.includes(chain.value);
            return (
              <Col key={chain.value} span={isMobilePX ? 24 : 8}>
                <CommonTooltip title={chain.tooltip} trigger={isMobile ? 'click' : 'hover'}>
                  <div
                    className={clsx(
                      styles['select-chain-checkbox-item'],
                      checked && styles['select-chain-checkbox-item-checked'],
                      chain.disabled && styles['select-chain-checkbox-item-disabled'],
                    )}
                    onClick={() =>
                      handleChainsChange({
                        formKey,
                        value: chain.value,
                        checked: !checked,
                      })
                    }>
                    <div className={styles['select-chain-checkbox-content']}>
                      {chain.icon}
                      <span className={styles['select-chain-checkbox-label']}>{chain.label}</span>
                    </div>
                    <Checkbox value={chain.value} checked={checked} disabled={chain.disabled} />
                  </div>
                </CommonTooltip>
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
        <Form className={styles['select-chain-form']} form={form} layout="vertical">
          <Form.Item label="Token">
            <div className={styles['select-chain-token-row']}>
              <TokenRow
                symbol="SGR-1"
                name="SGR"
                icon="https://raw.githubusercontent.com/Awaken-Finance/assets/main/blockchains/AELF/assets/SGR-1/logo24%403x.png"
              />
            </div>
          </Form.Item>
          {renderChainsFormItem(SelectChainFormKeys.AELF_CHAINS)}
          {renderChainsFormItem(SelectChainFormKeys.OTHER_CHAINS)}
          <Form.Item
            name={SelectChainFormKeys.INITIAL_SUPPLY}
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
              allowClear
              placeholder={SELECT_CHAIN_FORM_PLACEHOLDER_MAP[SelectChainFormKeys.INITIAL_SUPPLY]}
            />
          </Form.Item>
        </Form>
        <div className={styles['select-chain-footer']}>
          <CommonButton
            size={CommonButtonSize.Small}
            onClick={() => setCreationProgressModalOpen(true)}>
            Next
          </CommonButton>
          <CommonButton type={CommonButtonType.Secondary} size={CommonButtonSize.Small}>
            Back
          </CommonButton>
        </div>
      </div>
      <CreationProgressModal open={creationProgressModalOpen} />
    </>
  );
}
