import clsx from 'clsx';
import SelectChain from 'components/SelectChain';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { CHAIN_LIST, IChainNameItem } from 'constants/index';
import { useSetCurrentChainItem } from 'hooks/common';
import { SideMenuKey } from 'constants/home';
import { useEffect } from 'react';
import { useWithdraw } from 'hooks/withdraw';
import { useAccounts } from 'hooks/portkeyWallet';

interface SelectChainWrapperProps {
  className?: string;
  mobileTitle?: string;
  mobileLabel?: string;
  webLabel?: string;
  chainChanged: (item: IChainNameItem) => void;
}

export default function SelectChainWrapper({
  className,
  mobileTitle = '',
  mobileLabel,
  webLabel,
  chainChanged,
}: SelectChainWrapperProps) {
  const { isMobilePX } = useCommonState();
  const { currentChainItem } = useWithdraw();
  const accounts = useAccounts();
  const setCurrentChainItem = useSetCurrentChainItem();

  useEffect(() => {
    // Default: first one
    // The first one is empty, show the second one
    if (!accounts?.[CHAIN_LIST[0].key]?.[0]) {
      setCurrentChainItem(CHAIN_LIST[1]);
    }
    if (accounts?.[CHAIN_LIST[0].key]?.[0] && !currentChainItem) {
      setCurrentChainItem(CHAIN_LIST[0], SideMenuKey.Withdraw);
    }
  }, [accounts, currentChainItem, setCurrentChainItem]);

  return (
    <div className={clsx(styles['select-chain-wrapper'], className)}>
      <span className={styles['select-chain-label']}>{isMobilePX ? mobileLabel : webLabel}</span>
      <SelectChain
        title={mobileTitle}
        clickCallback={chainChanged}
        menuItems={CHAIN_LIST}
        selectedItem={currentChainItem}
      />
    </div>
  );
}
