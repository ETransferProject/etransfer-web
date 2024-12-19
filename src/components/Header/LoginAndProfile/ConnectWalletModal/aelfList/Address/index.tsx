import React, { useCallback, useMemo, useState } from 'react';
import styles from '../../styles.module.scss';
import { CHAIN_NAME_ENUM, SupportedChainId } from 'constants/index';
import Copy, { CopySize } from 'components/Copy';
import { useGetAelfAccount } from 'hooks/wallet/useAelf';
import { getOmittedStr } from 'utils/calculate';
import clsx from 'clsx';
import { AelfSmall, tDVVSmall as TDVVSmall } from 'assets/images';

export default function Address() {
  const accounts = useGetAelfAccount();
  const [isShowCopy, setIsShowCopy] = useState(false);
  const [isShowCopyIndex, setIsShowCopyIndex] = useState<number>();

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

  const handleMouseEnter = useCallback((event: any, index: number) => {
    event.stopPropagation();
    setIsShowCopy(true);
    setIsShowCopyIndex(index);
  }, []);

  const handleMouseLeave = useCallback((event: any) => {
    event.stopPropagation();
    setIsShowCopy(false);
    setIsShowCopyIndex(undefined);
  }, []);

  return (
    <div className={styles['wallet-aelf-address']}>
      <div className={styles['wallet-aelf-address-divider']} />
      <div className="flex-column gap-4">
        {accountsList.map((item, index) => (
          <div
            className={clsx('flex-column', styles['wallet-aelf-address-item'])}
            key={item.key + index}
            onMouseEnter={(event) => handleMouseEnter(event, index)}
            onMouseLeave={handleMouseLeave}>
            <div className="flex-row-center gap-8">
              <span className={styles['wallet-list-item-name']}>
                {getOmittedStr(item.value, 8, 9)}
              </span>
              {isShowCopy && isShowCopyIndex === index && (
                <Copy toCopy={item.value} size={CopySize.Small} />
              )}
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
