import { Select } from 'antd';
import styles from './styles.module.scss';
import { useCallback } from 'react';
import { InfoBusinessTypeOptions } from 'constants/infoDashboard';
import clsx from 'clsx';
import { TokensDashboardType } from 'types/api';
import { TokenDashboardFilterProps } from '../../types';

export default function WebTokensHeader({ selectType, onTypeChange }: TokenDashboardFilterProps) {
  const handleTypeChange = useCallback(
    (type: TokensDashboardType) => {
      onTypeChange(type);
    },
    [onTypeChange],
  );

  return (
    <div className={clsx('flex-row-center-between', styles['web-tokens-header'])}>
      <span className={styles['title']}>Tokens</span>
      <div className={styles['web-tokens-header-filter']}>
        <Select
          size={'large'}
          value={selectType}
          className={styles['web-tokens-select-type']}
          onChange={handleTypeChange}
          popupClassName={'drop-wrap'}
          options={InfoBusinessTypeOptions}
        />
      </div>
    </div>
  );
}
