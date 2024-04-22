import React, { useMemo } from 'react';
import CommonAddress from 'components/CommonAddress';
import styles from './styles.module.scss';
import { CHAIN_LIST } from 'constants/index';
import { CopySize } from 'components/Copy';
import { SynchronizingAddress } from 'constants/chain';
import { useAccounts } from 'hooks/portkeyWallet';
import clsx from 'clsx';

interface AddressProps {
  hideBorder?: boolean;
}

export default function Address({ hideBorder }: AddressProps) {
  const accounts = useAccounts();

  const accountsList = useMemo(() => {
    const temp = [];
    if (accounts?.AELF) {
      temp.push({
        label: CHAIN_LIST[0].label,
        value: typeof accounts?.AELF === 'string' ? accounts?.AELF : accounts?.AELF[0] || '',
      });
    }
    if (accounts?.tDVW) {
      temp.push({
        label: CHAIN_LIST[1].label,
        value: typeof accounts?.tDVW === 'string' ? accounts?.tDVW : accounts?.tDVW[0] || '',
      });
    }
    return temp;
  }, [accounts]);

  return (
    <>
      <div>
        {accountsList.map((item) => (
          <div
            key={item.label}
            className={clsx(
              styles['address-wrapper'],
              hideBorder ? styles['address-hideBorder'] : '',
            )}>
            <CommonAddress
              labelClassName={styles['label']}
              valueClassName={styles['value']}
              valueWrapperClassName={'flex-row-start'}
              label={item.label}
              value={item.value || SynchronizingAddress}
              showCopy={!!item.value && item.value !== SynchronizingAddress}
              copySize={CopySize.Small}
            />
          </div>
        ))}
      </div>
    </>
  );
}
