import { TNetworkItem, TDepositTokenItem } from 'types/api';
import SelectNetwork from '../SelectNetwork';
import SelectToken from '../SelectToken';
import styles from './styles.module.scss';
import CommonSpace from 'components/CommonSpace';
import { useDepositState } from 'store/Provider/hooks';
import { useDepositNetworkList } from 'hooks/deposit';
import { useMemo } from 'react';

type TSelectTokenNetwork = {
  label: string;
  tokenSelected?: TDepositTokenItem;
  networkSelected?: TNetworkItem;
  networkSelectCallback: (item: TNetworkItem) => Promise<void>;
  tokenSelectCallback: (item: TDepositTokenItem) => void;
};
export default function SelectTokenNetwork({
  label,
  tokenSelected,
  networkSelected,
  networkSelectCallback,
  tokenSelectCallback,
}: TSelectTokenNetwork) {
  const { fromTokenList, fromTokenSymbol, toTokenSymbol } = useDepositState();

  const getFromNetworkList = useDepositNetworkList();
  const newFromNetworkList = useMemo(() => {
    return getFromNetworkList(fromTokenSymbol, toTokenSymbol);
  }, [fromTokenSymbol, getFromNetworkList, toTokenSymbol]);

  return (
    <div className={styles['deposit-select-token-network']}>
      <SelectNetwork
        label={label}
        networkList={newFromNetworkList || []}
        selected={networkSelected}
        selectCallback={networkSelectCallback}
      />
      <CommonSpace direction="vertical" size={20} />
      <SelectToken
        tokenList={fromTokenList}
        selected={tokenSelected}
        selectCallback={tokenSelectCallback}
      />
    </div>
  );
}
