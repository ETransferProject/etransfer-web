import { Select } from 'antd';
import styles from './styles.module.scss';
import { InfoBusinessTypeOptions } from 'constants/infoDashboard';
import clsx from 'clsx';
import { WebTransferDashboardHeaderProps } from '../../types';
import { useFilter } from '../../hooks';

const SelectSize = 'large';

export default function WebTransferHeader({
  fromTokenList,
  fromChainList,
  toTokenList,
  toChainList,
  type,
  fromToken,
  fromChain,
  toToken,
  toChain,
  handleTypeChange,
  handleFromTokenChange,
  handleFromChainChange,
  handleToTokenChange,
  handleToChainChange,
}: WebTransferDashboardHeaderProps) {
  const { fromTokenOptions, fromChainOptions, toTokenOptions, toChainOptions } = useFilter({
    fromTokenList,
    fromChainList,
    toTokenList,
    toChainList,
  });

  return (
    <div className={styles['web-transfer-header']}>
      <span className={styles['title']}>Transfer</span>
      <div className={clsx('flex-row', styles['web-transfer-header-filter'])}>
        <Select
          size={SelectSize}
          value={type}
          className={styles['web-records-select-type']}
          onChange={handleTypeChange}
          popupClassName={'drop-wrap'}
          options={InfoBusinessTypeOptions}
        />
        <Select
          size={SelectSize}
          value={fromToken}
          className={styles['web-records-select-type']}
          onChange={handleFromTokenChange}
          popupClassName={'drop-wrap'}
          options={fromTokenOptions}
        />
        <Select
          size={SelectSize}
          value={fromChain}
          className={styles['web-records-select-type']}
          onChange={handleFromChainChange}
          popupClassName={'drop-wrap'}
          options={fromChainOptions}
        />
        <Select
          size={SelectSize}
          value={toToken}
          className={styles['web-records-select-type']}
          onChange={handleToTokenChange}
          popupClassName={'drop-wrap'}
          options={toTokenOptions}
        />

        <Select
          size={SelectSize}
          value={toChain}
          className={styles['web-records-select-type']}
          onChange={handleToChainChange}
          popupClassName={'drop-wrap'}
          options={toChainOptions}
        />
      </div>
    </div>
  );
}
