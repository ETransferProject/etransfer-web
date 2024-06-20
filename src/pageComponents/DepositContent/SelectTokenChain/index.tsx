import { TToTokenItem, TDepositTokenItem } from 'types/api';
import SelectChainWrapper from '../SelectChainWrapper';
import SelectToken from '../SelectToken';
import styles from './styles.module.scss';
import { CHAIN_LIST, IChainNameItem } from 'constants/index';
import Space from 'components/Space';
import { useEffect, useMemo } from 'react';
import { useAccounts } from 'hooks/portkeyWallet';
import { useAppDispatch, useDepositState } from 'store/Provider/hooks';
import { setToChainItem } from 'store/reducers/deposit/slice';

type TSelectTokenChain = {
  label: string;
  tokenSelected?: TToTokenItem;
  chainChanged: (item: IChainNameItem) => void;
  tokenSelectCallback: (item: TDepositTokenItem) => void;
};
export default function SelectTokenChain({
  label,
  tokenSelected,
  chainChanged,
  tokenSelectCallback,
}: TSelectTokenChain) {
  const { toChainItem, toChainList, toTokenList } = useDepositState();
  const accounts = useAccounts();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Default: first one
    // The first one is empty, show the second one
    if (accounts?.[CHAIN_LIST[0].key]?.[0] && !toChainItem) {
      dispatch(setToChainItem(CHAIN_LIST[0]));
    }
  }, [accounts, dispatch, toChainItem]);

  const menuItems = useMemo(() => toChainList || CHAIN_LIST, [toChainList]);

  return (
    <div className={styles['deposit-select-token-chain']}>
      <SelectChainWrapper
        menuItems={menuItems}
        selectedItem={toChainItem}
        webLabel={label}
        mobileLabel={label}
        mobileTitle={`Deposit ${label}`}
        chainChanged={chainChanged}
      />
      <Space direction="vertical" size={20} />
      <SelectToken
        tokenList={toTokenList}
        selected={tokenSelected}
        selectCallback={tokenSelectCallback}
      />
    </div>
  );
}
