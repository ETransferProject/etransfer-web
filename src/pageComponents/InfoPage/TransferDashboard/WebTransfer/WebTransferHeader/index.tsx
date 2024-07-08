import { Select } from 'antd';
import styles from './styles.module.scss';
import { useCallback, useMemo, useState } from 'react';
import {
  DefaultTransferDashboardFromChainOptions,
  DefaultTransferDashboardFromTokenOptions,
  DefaultTransferDashboardToChainOptions,
  DefaultTransferDashboardToTokenOptions,
  InfoBusinessType,
  InfoBusinessTypeOptions,
} from 'constants/infoDashboard';
import { ChainId } from '@portkey/types';
import clsx from 'clsx';

const SelectSize = 'large';

export interface WebTransferHeaderProps {
  fromTokenList: string[];
  fromChainList: ChainId[];
  toTokenList: string[];
  toChainList: ChainId[];
}

export default function WebTransferHeader({
  fromTokenList,
  fromChainList,
  toTokenList,
  toChainList,
}: WebTransferHeaderProps) {
  const [businessType, setBusinessType] = useState<InfoBusinessType>(InfoBusinessType.ALL);
  const [fromToken, setFromToken] = useState<string>(
    DefaultTransferDashboardFromTokenOptions.label,
  );
  const [fromChain, setFromChain] = useState<string>(
    DefaultTransferDashboardFromChainOptions.label,
  );
  const [toToken, setToToken] = useState<string>(DefaultTransferDashboardToTokenOptions.label);
  const [toChain, setToChain] = useState<ChainId | string>(
    DefaultTransferDashboardToChainOptions.label,
  );

  const fromTokenOptions = useMemo(() => {
    const list: { value: number | string; label: string }[] = [
      DefaultTransferDashboardFromTokenOptions,
    ];
    fromTokenList.forEach((item) => {
      list.push({ value: item, label: item });
    });
    return list;
  }, [fromTokenList]);

  const fromChainOptions = useMemo(() => {
    const list: { value: number | string; label: string }[] = [
      DefaultTransferDashboardFromChainOptions,
    ];
    fromChainList.forEach((item) => {
      list.push({ value: item, label: item });
    });
    return list;
  }, [fromChainList]);

  const toTokenOptions = useMemo(() => {
    const list: { value: number | string; label: string }[] = [
      DefaultTransferDashboardToTokenOptions,
    ];
    toTokenList.forEach((item) => {
      list.push({ value: item, label: item });
    });
    return list;
  }, [toTokenList]);

  const toChainOptions = useMemo(() => {
    const list: { value: number | string; label: string }[] = [
      DefaultTransferDashboardToChainOptions,
    ];
    toChainList.forEach((item) => {
      list.push({ value: item, label: item });
    });
    return list;
  }, [toChainList]);

  const handleTypeChange = useCallback((type: InfoBusinessType) => {
    setBusinessType(type);

    //   dispatch(setSkipCount(1));
    //   requestRecordsList();
  }, []);

  const handleFromTokenChange = useCallback((symbol: string) => {
    setFromToken(symbol);

    //   dispatch(setSkipCount(1));
    //   requestRecordsList();
  }, []);

  const handleFromChainChange = useCallback((network: string) => {
    setFromChain(network);

    //   dispatch(setSkipCount(1));
    //   requestRecordsList();
  }, []);

  const handleToTokenChange = useCallback((symbol: string) => {
    setToToken(symbol);

    //   dispatch(setSkipCount(1));
    //   requestRecordsList();
  }, []);

  const handleToChainChange = useCallback((chainId: ChainId | string) => {
    setToChain(chainId);

    //   dispatch(setSkipCount(1));
    //   requestRecordsList();
  }, []);

  return (
    <div className={styles['web-transfer-header']}>
      <span className={styles['title']}>Transfer</span>
      <div className={clsx('flex-row', styles['web-transfer-header-filter'])}>
        <Select
          size={SelectSize}
          value={businessType}
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
