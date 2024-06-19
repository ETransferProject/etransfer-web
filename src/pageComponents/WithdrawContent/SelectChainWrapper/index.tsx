import clsx from 'clsx';
import SelectChain from 'components/SelectChain';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { CHAIN_LIST, IChainNameItem } from 'constants/index';
import { useWithdraw } from 'hooks/withdraw';
import { useAccounts } from 'hooks/portkeyWallet';
import { setWithdrawChainItem } from 'store/reducers/withdraw/slice';
import { useEffectOnce } from 'react-use';

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
  const { isPadPX } = useCommonState();
  const { currentChainItem } = useWithdraw();
  const accounts = useAccounts();
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    // Default: first one
    // The first one is empty, show the second one
    if (!accounts?.[CHAIN_LIST[0].key]?.[0]) {
      dispatch(setWithdrawChainItem(CHAIN_LIST[1]));
    }
    if (accounts?.[CHAIN_LIST[0].key]?.[0] && !currentChainItem) {
      dispatch(setWithdrawChainItem(CHAIN_LIST[0]));
    }
  });

  return (
    <div className={clsx(styles['select-chain-wrapper'], className)}>
      <span className={styles['select-chain-label']}>{isPadPX ? mobileLabel : webLabel}</span>
      <SelectChain
        title={mobileTitle}
        clickCallback={chainChanged}
        menuItems={CHAIN_LIST}
        selectedItem={currentChainItem}
      />
    </div>
  );
}
