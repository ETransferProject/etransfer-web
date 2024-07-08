import { FilterIcon } from 'assets/images';
import styles from './styles.module.scss';
import CommonDrawer from 'components/CommonDrawer';
import { useCallback, useState } from 'react';
import { InfoBusinessType, InfoBusinessTypeOptions } from 'constants/infoDashboard';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import { Select } from 'antd';
import clsx from 'clsx';

export default function MobileTransferHeader() {
  const [isShowFilterDrawer, setIsShowFilterDrawer] = useState(false);
  const [filterType, setFilterType] = useState<InfoBusinessType>(InfoBusinessType.ALL);

  const handleOpenFilterDrawer = useCallback(() => {
    setIsShowFilterDrawer(true);
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilterType(InfoBusinessType.ALL);
  }, []);

  const handleApplyFilter = useCallback(() => {
    console.log('apply', '');
  }, []);

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
            className={clsx(styles['mobile-transfer-select-type'], styles['border-change'])}
            onChange={setFilterType}
            popupClassName={'drop-wrap'}
            options={InfoBusinessTypeOptions}
          />
        </div>
      </CommonDrawer>
    </div>
  );
}
