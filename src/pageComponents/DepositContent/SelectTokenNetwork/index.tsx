import { TNetworkItem, TDepositTokenItem } from 'types/api';
import SelectNetwork from '../SelectNetwork';
import SelectToken from '../SelectToken';
import styles from './styles.module.scss';
import Space from 'components/Space';
import { useDepositState } from 'store/Provider/hooks';

type TSelectTokenNetwork = {
  label: string;
  tokenSelected?: TDepositTokenItem;
  networkSelected?: TNetworkItem;
  isShowNetworkLoading?: boolean;
  networkSelectCallback: (item: TNetworkItem) => Promise<void>;
  tokenSelectCallback: (item: TDepositTokenItem) => void;
};
export default function SelectTokenNetwork({
  label,
  tokenSelected,
  networkSelected,
  isShowNetworkLoading,
  networkSelectCallback,
  tokenSelectCallback,
}: TSelectTokenNetwork) {
  const { fromTokenList, fromNetworkList } = useDepositState();

  return (
    <div className={styles['deposit-select-token-network']}>
      <SelectNetwork
        label={label}
        networkList={fromNetworkList || []}
        selected={networkSelected}
        isShowLoading={isShowNetworkLoading}
        selectCallback={networkSelectCallback}
      />
      <Space direction="vertical" size={20} />
      <SelectToken
        tokenList={fromTokenList}
        selected={tokenSelected}
        selectCallback={tokenSelectCallback}
      />
    </div>
  );
}
