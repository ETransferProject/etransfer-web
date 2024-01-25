import React, { useMemo } from 'react';
import CommonAddress from 'components/CommonAddress';
import LogoutButton from 'pageComponents/LogoutButton';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { CHAIN_LIST } from 'constants/index';
import { CopySize } from 'components/Copy';
import { SynchronizingAddress } from 'constants/chain';
import { useAccounts } from 'hooks/portkeyWallet';

export default function Address() {
  const { isMobilePX } = useCommonState();
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
          <div key={item.label} className={styles['address-wrapper']}>
            <CommonAddress
              labelClassName={styles['label']}
              valueClassName={styles['value']}
              valueWrapperClassName={'flex-row-start'}
              label={item.label}
              value={item.value || SynchronizingAddress}
              showCopy={item.value !== SynchronizingAddress}
              copySize={CopySize.Small}
            />
          </div>
        ))}
      </div>
      {!isMobilePX && (
        <div className={styles['button-wrapper']}>
          <LogoutButton />
        </div>
      )}
    </>
  );
}
