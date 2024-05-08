import { TNetworkItem, TTokenItem } from 'types/api';
import SelectNetwork from '../SelectNetwork';
import SelectToken from '../SelectToken';
import styles from './styles.module.scss';
import Space from 'components/Space';

type TSelectTokenNetwork = {
  label: string;
  tokenList: TTokenItem[];
  networkList: TNetworkItem[];
  tokenSelected?: TTokenItem;
  networkSelected?: TNetworkItem;
  isShowNetworkLoading?: boolean;
  networkSelectCallback: (item: TNetworkItem) => Promise<void>;
  tokenSelectCallback: (item: TTokenItem) => void;
};
export default function SelectTokenNetwork({
  label,
  tokenList,
  tokenSelected,
  networkList,
  networkSelected,
  isShowNetworkLoading,
  networkSelectCallback,
  tokenSelectCallback,
}: TSelectTokenNetwork) {
  return (
    <div className={styles['deposit-select-token-network']}>
      <SelectNetwork
        label={label}
        networkList={networkList}
        selected={networkSelected}
        isShowLoading={isShowNetworkLoading}
        selectCallback={networkSelectCallback}
      />
      <Space direction="vertical" size={20} />
      <SelectToken
        tokenList={tokenList}
        selected={tokenSelected}
        selectCallback={tokenSelectCallback}
      />
    </div>
  );
}
