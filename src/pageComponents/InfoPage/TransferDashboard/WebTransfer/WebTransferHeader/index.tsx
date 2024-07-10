import { Button, Select } from 'antd';
import styles from './styles.module.scss';
import { InfoBusinessTypeOptions } from 'constants/infoDashboard';
import clsx from 'clsx';
import { WebTransferDashboardHeaderProps } from '../../types';
import { useFilter } from '../../hooks';
import { Reset } from 'assets/images';
import { useCallback } from 'react';

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
  handleResetFilter,
}: WebTransferDashboardHeaderProps) {
  const { fromTokenOptions, fromChainOptions, toTokenOptions, toChainOptions } = useFilter({
    fromTokenList,
    fromChainList,
    toTokenList,
    toChainList,
  });

  const isShowReset = useCallback(() => {
    let isShow = false;
    if (type !== 0 || fromToken !== 0 || fromChain !== 0 || toToken !== 0 || toChain !== 0) {
      isShow = true;
    }
    return isShow;
  }, [type, fromToken, fromChain, toToken, toChain]);

  return (
    <div className={styles['web-transfer-header']}>
      <span className={styles['title']}>Transfer</span>
      <div className={clsx('flex-row', styles['web-transfer-header-filter'])}>
        <Select
          size={SelectSize}
          value={type}
          className={styles['web-transfer-select']}
          onChange={handleTypeChange}
          popupClassName={'drop-wrap'}
          options={InfoBusinessTypeOptions}
        />
        <Select
          size={SelectSize}
          value={fromToken}
          className={styles['web-transfer-select']}
          onChange={handleFromTokenChange}
          popupClassName={'drop-wrap'}
          options={fromTokenOptions}
        />
        <Select
          size={SelectSize}
          value={fromChain}
          className={styles['web-transfer-select']}
          onChange={handleFromChainChange}
          popupClassName={'drop-wrap'}
          options={fromChainOptions}
        />
        <Select
          size={SelectSize}
          value={toToken}
          className={styles['web-transfer-select']}
          onChange={handleToTokenChange}
          popupClassName={'drop-wrap'}
          options={toTokenOptions}
        />

        <Select
          size={SelectSize}
          value={toChain}
          className={styles['web-transfer-select']}
          onChange={handleToChainChange}
          popupClassName={'drop-wrap'}
          options={toChainOptions}
        />
        {isShowReset() && (
          <Button
            className={clsx(styles['web-transfer-reset-button'])}
            size={'large'}
            onClick={handleResetFilter}>
            <Reset className={clsx(styles['web-transfer-reset-icon'])} />
            <span className={clsx(styles['web-transfer-reset-word'])}>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
