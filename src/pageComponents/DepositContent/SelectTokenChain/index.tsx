import { TTokenItem } from 'types/api';
import SelectChainWrapper from '../SelectChainWrapper';
import SelectToken from '../SelectToken';
import styles from './styles.module.scss';
import { IChainNameItem } from 'constants/index';
import Space from 'components/Space';

type TSelectTokenChain = {
  label: string;
  tokenList: TTokenItem[];
  tokenSelected?: TTokenItem;
  chainChanged: (item: IChainNameItem) => void;
  tokenSelectCallback: (item: TTokenItem) => void;
};
export default function SelectTokenChain({
  label,
  tokenList,
  tokenSelected,
  chainChanged,
  tokenSelectCallback,
}: TSelectTokenChain) {
  return (
    <div className={styles['deposit-select-token-chain']}>
      <SelectChainWrapper
        webLabel={label}
        mobileLabel={label}
        mobileTitle={`Deposit ${label}`}
        chainChanged={chainChanged}
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
