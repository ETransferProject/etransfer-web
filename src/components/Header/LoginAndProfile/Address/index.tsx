import React, { useMemo } from 'react';
import CommonAddress from 'components/CommonAddress';
import styles from './styles.module.scss';
import { SupportedChainId } from 'constants/index';
import { CopySize } from 'components/Copy';
import { SynchronizingAddress } from 'constants/chain';
import { useGetAccount } from 'hooks/wallet';
import clsx from 'clsx';

interface AddressProps {
  hideBorder?: boolean;
}

export default function Address({ hideBorder }: AddressProps) {
  const accounts = useGetAccount();

  const accountsList = useMemo(() => {
    const temp = [];
    if (accounts?.[SupportedChainId.mainChain]) {
      const defaultAddress = accounts?.[SupportedChainId.mainChain];
      temp.push({
        label: SupportedChainId.mainChain,
        value: defaultAddress || '',
      });
    }
    if (accounts?.[SupportedChainId.sideChain]) {
      const defaultAddress = accounts?.[SupportedChainId.sideChain];
      temp.push({
        label: SupportedChainId.sideChain,
        value: defaultAddress || '',
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
              copySize={CopySize.Normal}
            />
          </div>
        ))}
      </div>
    </>
  );
}
