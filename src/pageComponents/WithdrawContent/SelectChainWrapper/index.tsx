import clsx from 'clsx';
import SelectChain from 'components/SelectChain';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { CHAIN_LIST, IChainNameItem } from 'constants/index';
import { useWithdraw } from 'hooks/withdraw';
import { useGetAelfAccount } from 'hooks/wallet/useAelf';
import { setWithdrawChainItem } from 'store/reducers/withdraw/slice';
import { useEffectOnce } from 'react-use';
import { SELECT_CHAIN } from 'constants/misc';

interface SelectChainWrapperProps {
  className?: string;
  mobileLabel?: string;
  webLabel?: string;
  chainChanged: (item: IChainNameItem) => void;
}

export default function SelectChainWrapper({
  className,
  mobileLabel,
  webLabel,
  chainChanged,
}: SelectChainWrapperProps) {
  const { isPadPX } = useCommonState();
  const { currentChainItem } = useWithdraw();
  const accounts = useGetAelfAccount();
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    // Default: first one
    // The first one is empty, show the second one
    if (!accounts?.[CHAIN_LIST[0].key]) {
      dispatch(setWithdrawChainItem(CHAIN_LIST[1]));
    }
    if (accounts?.[CHAIN_LIST[0].key] && !currentChainItem) {
      dispatch(setWithdrawChainItem(CHAIN_LIST[0]));
    }
  });

  return (
    <div className={clsx(styles['select-chain-wrapper'], className)} id="withdrawChainSelect">
      <span className={styles['select-chain-label']}>{isPadPX ? mobileLabel : webLabel}</span>
      <SelectChain
        menuItems={CHAIN_LIST}
        selectedItem={currentChainItem}
        clickCallback={chainChanged}
        title={SELECT_CHAIN}
      />
    </div>
  );
}
