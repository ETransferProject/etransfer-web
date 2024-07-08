import { Select } from 'antd';
import styles from './styles.module.scss';
import { useCallback, useState } from 'react';
import { InfoBusinessType, InfoBusinessTypeOptions } from 'constants/infoDashboard';
import clsx from 'clsx';

export default function WebTokensHeader() {
  const [businessType, setBusinessType] = useState<InfoBusinessType>(InfoBusinessType.ALL);

  const handleTypeChange = useCallback((type: InfoBusinessType) => {
    setBusinessType(type);

    //   dispatch(setSkipCount(1));
    //   requestRecordsList();
  }, []);

  return (
    <div className={clsx('flex-row-center-between', styles['web-tokens-header'])}>
      <span className={styles['title']}>Tokens</span>
      <div className={styles['web-tokens-header-filter']}>
        <Select
          size={'large'}
          value={businessType}
          className={styles['web-records-select-type']}
          onChange={handleTypeChange}
          popupClassName={'drop-wrap'}
          options={InfoBusinessTypeOptions}
        />
      </div>
    </div>
  );
}
