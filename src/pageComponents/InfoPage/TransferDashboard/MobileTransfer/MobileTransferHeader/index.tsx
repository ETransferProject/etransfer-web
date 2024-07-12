import { FilterIcon } from 'assets/images';
import styles from './styles.module.scss';
import CommonDrawer from 'components/CommonDrawer';
import { useCallback, useState } from 'react';
import { InfoBusinessTypeOptions } from 'constants/infoDashboard';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import { Select } from 'antd';
import clsx from 'clsx';
import { useFilter } from '../../hooks';
import { MobileTransferDashboardHeaderProps } from '../../types';
import { TokensDashboardType } from 'types/api';

export default function MobileTransferHeader({
  fromTokenList,
  fromChainList,
  toTokenList,
  toChainList,
  type,
  fromToken,
  fromChain,
  toToken,
  toChain,
  handleResetFilter,
  handleApplyFilter,
}: MobileTransferDashboardHeaderProps) {
  const [isShowFilterDrawer, setIsShowFilterDrawer] = useState(false);

  const [newFilterType, setNewFilterType] = useState<TokensDashboardType>(type);
  const [newFilterFromToken, setNewFilterFromToken] = useState<number>(fromToken);
  const [newFilterFromChain, setNewFilterFromChain] = useState<number>(fromChain);
  const [newFilterToToken, setNewFilterToToken] = useState<number>(toToken);
  const [newFilterToChain, setNewFilterToChain] = useState<number>(toChain);

  const { fromTokenOptions, fromChainOptions, toTokenOptions, toChainOptions } = useFilter({
    fromTokenList,
    fromChainList,
    toTokenList,
    toChainList,
  });

  const handleOpenFilterDrawer = useCallback(() => {
    setIsShowFilterDrawer(true);
  }, []);

  const onApply = useCallback(() => {
    handleApplyFilter({
      type: newFilterType,
      fromToken: newFilterFromToken,
      fromChain: newFilterFromChain,
      toToken: newFilterToChain,
      toChain: newFilterToChain,
    });

    setIsShowFilterDrawer(false);
  }, [handleApplyFilter, newFilterFromChain, newFilterFromToken, newFilterToChain, newFilterType]);

  return (
    <div className={styles['mobile-transfer-header']}>
      <div className="flex-row-center-between">
        <div className={styles['title']}>Transfer</div>
        <FilterIcon className={styles['filter-icon']} onClick={handleOpenFilterDrawer} />
      </div>

      <CommonDrawer
        open={isShowFilterDrawer}
        height={'100%'}
        title={<div className={styles['filter-title']}>Filters</div>}
        id="TransferDashboardFilterMobileDrawer"
        className={styles['filter-drawer-wrapper']}
        destroyOnClose
        placement={'right'}
        footer={
          <div className={styles['drawer-button-wrapper']}>
            <CommonButton
              className={styles['cancel-button']}
              type={CommonButtonType.Secondary}
              onClick={handleResetFilter}>
              {'Reset'}
            </CommonButton>
            <CommonButton className={styles['ok-button']} onClick={onApply}>
              {'Apply'}
            </CommonButton>
          </div>
        }
        onClose={() => setIsShowFilterDrawer(!isShowFilterDrawer)}>
        <div className={styles['filter-drawer-content']}>
          <div className={styles['filter-drawer-label']}>Type</div>
          <Select
            size={'large'}
            value={newFilterType}
            className={clsx(styles['mobile-transfer-select-type'], styles['border-change'])}
            onChange={setNewFilterType}
            popupClassName={'drop-wrap'}
            options={InfoBusinessTypeOptions}
          />

          <div className={styles['filter-drawer-label']}>Source Token</div>
          <Select
            size={'large'}
            value={newFilterFromToken}
            className={clsx(styles['mobile-transfer-select-type'], styles['border-change'])}
            onChange={setNewFilterFromToken}
            popupClassName={'drop-wrap'}
            options={fromTokenOptions}
          />

          <div className={styles['filter-drawer-label']}>Source Chain</div>
          <Select
            size={'large'}
            value={newFilterFromChain}
            className={clsx(styles['mobile-transfer-select-type'], styles['border-change'])}
            onChange={setNewFilterFromChain}
            popupClassName={'drop-wrap'}
            options={fromChainOptions}
          />

          <div className={styles['filter-drawer-label']}>Destination Token</div>
          <Select
            size={'large'}
            value={newFilterToToken}
            className={clsx(styles['mobile-transfer-select-type'], styles['border-change'])}
            onChange={setNewFilterToToken}
            popupClassName={'drop-wrap'}
            options={toTokenOptions}
          />

          <div className={styles['filter-drawer-label']}>Destination Chain</div>
          <Select
            size={'large'}
            value={newFilterToChain}
            className={clsx(styles['mobile-transfer-select-type'], styles['border-change'])}
            onChange={setNewFilterToChain}
            popupClassName={'drop-wrap'}
            options={toChainOptions}
          />
        </div>
      </CommonDrawer>
    </div>
  );
}
