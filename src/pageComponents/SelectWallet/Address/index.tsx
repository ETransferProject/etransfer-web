import React, { useMemo } from 'react';
import CommonAddress from 'components/CommonAddress';
import styles from './styles.module.scss';
import { SupportedChainId } from 'constants/index';
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
    if (accounts?.[SupportedChainId.mainChain]) {
      const defaultAddress = accounts?.[SupportedChainId.mainChain];
      const arrayAddress = accounts?.[SupportedChainId.mainChain]?.[0];
      temp.push({
        label: SupportedChainId.mainChain,
        value: typeof defaultAddress === 'string' ? defaultAddress : arrayAddress || '',
      });
    }
    if (accounts?.[SupportedChainId.sideChain]) {
      const defaultAddress = accounts?.[SupportedChainId.sideChain];
      const arrayAddress = accounts?.[SupportedChainId.sideChain]?.[0];
      temp.push({
        label: SupportedChainId.sideChain,
        value: typeof defaultAddress === 'string' ? defaultAddress : arrayAddress || '',
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
