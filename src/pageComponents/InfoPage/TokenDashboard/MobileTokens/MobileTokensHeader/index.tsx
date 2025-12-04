import { FilterIcon } from 'assets/images';
import styles from './styles.module.scss';
import CommonDrawer from 'components/CommonDrawer';
import { useCallback, useState } from 'react';
import { InfoBusinessTypeOptions } from 'constants/infoDashboard';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import { Select } from 'antd';
import clsx from 'clsx';
import { TokensDashboardType } from 'types/api';
import { TokenDashboardFilterProps } from '../../types';

export default function MobileTokensHeader({
  selectType,
  onTypeChange,
}: TokenDashboardFilterProps) {
  const [isShowFilterDrawer, setIsShowFilterDrawer] = useState(false);
  const [filterType, setFilterType] = useState<TokensDashboardType>(selectType);

  const handleOpenFilterDrawer = useCallback(() => {
    setIsShowFilterDrawer(true);
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilterType(TokensDashboardType.All);
    onTypeChange(TokensDashboardType.All);

    setIsShowFilterDrawer(false);
  }, [onTypeChange]);

  const handleApplyFilter = useCallback(() => {
    onTypeChange(filterType);
    setIsShowFilterDrawer(false);
  }, [filterType, onTypeChange]);

  return (
    <div className={styles['mobile-tokens-header']}>
      <div className="flex-row-center-between">
        <div className={styles['title']}>Tokens</div>
        <FilterIcon className={styles['filter-icon']} onClick={handleOpenFilterDrawer} />
      </div>

      <CommonDrawer
        open={isShowFilterDrawer}
        height={'100%'}
        title={<div className={styles['filter-title']}>Filters</div>}
        id="TokenDashboardFilterMobileDrawer"
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
            <CommonButton className={styles['ok-button']} onClick={() => handleApplyFilter()}>
              {'Apply'}
            </CommonButton>
          </div>
        }
        onClose={() => setIsShowFilterDrawer(!isShowFilterDrawer)}>
        <div className={styles['filter-drawer-content']}>
          <div className={styles['filter-drawer-label']}>Type</div>
          <Select
            size={'large'}
            value={filterType}
            className={clsx(styles['mobile-tokens-select-type'], styles['border-change'])}
            onChange={setFilterType}
            popupClassName={'drop-wrap'}
            options={InfoBusinessTypeOptions}
          />
        </div>
      </CommonDrawer>
    </div>
  );
}
