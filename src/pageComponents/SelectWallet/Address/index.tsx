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

  const accountsList = useMemo(
    () => [
      {
        label: CHAIN_LIST[0].label,
        value: accounts?.[CHAIN_LIST[0].key]?.[0] || '',
      },
      {
        label: CHAIN_LIST[1].label,
        value: accounts?.[CHAIN_LIST[1].key]?.[0] || '',
      },
    ],
    [accounts],
  );

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
