import React, { useMemo } from 'react';
import styles from '../../styles.module.scss';
import { CHAIN_NAME_ENUM, SupportedChainId } from 'constants/index';
import Copy, { CopySize } from 'components/Copy';
import { useGetAccount } from 'hooks/wallet/useAelf';
import { getOmittedStr } from 'utils/calculate';
import clsx from 'clsx';
import { AelfSmall, tDVVSmall as TDVVSmall } from 'assets/images';

export default function Address() {
  const accounts = useGetAccount();

  const accountsList = useMemo(() => {
    const temp = [];
    if (accounts?.[SupportedChainId.mainChain]) {
      const defaultAddress = accounts?.[SupportedChainId.mainChain];
      temp.push({
        label: CHAIN_NAME_ENUM.MainChain,
        key: SupportedChainId.mainChain,
        value: defaultAddress || '',
      });
    }
    if (accounts?.[SupportedChainId.sideChain]) {
      const defaultAddress = accounts?.[SupportedChainId.sideChain];
      temp.push({
        label: CHAIN_NAME_ENUM.SideChain,
        key: SupportedChainId.sideChain,
        value: defaultAddress || '',
      });
    }
    return temp;
  }, [accounts]);

  return (
    <div className={styles['wallet-aelf-address']}>
      <div className={styles['wallet-aelf-address-divider']} />
      <div className="flex-column gap-4">
        {accountsList.map((item) => (
          <div className={clsx('flex-column', styles['wallet-aelf-address-item'])} key={item.key}>
            <div className="flex-row-center gap-8">
              <span className={styles['wallet-list-item-name']}>
                {getOmittedStr(item.value, 5, 5)}
              </span>
              <Copy toCopy={item.value} size={CopySize.Small} />
            </div>
            <div className="flex-row-center gap-4">
              {item.key === SupportedChainId.mainChain ? <AelfSmall /> : <TDVVSmall />}
              <div className={styles['wallet-list-item-desc']}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
