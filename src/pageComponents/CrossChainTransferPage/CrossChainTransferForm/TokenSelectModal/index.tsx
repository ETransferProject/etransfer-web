import CommonModal from 'components/CommonModal';
import styles from './styles.module.scss';
import { Input } from 'antd';
import { TTokenItem } from 'types/api';
import { SelectImage } from 'components/SelectToken/TokenCard';
import { formatSymbolDisplay } from 'utils/format';
import clsx from 'clsx';
import { SearchIcon } from 'assets/images';

export interface TokenSelectModalProps {
  className?: string;
  open: boolean;
  tokenList: TTokenItem[];
  onSelect: (item: TTokenItem) => Promise<void>;
  onClose: () => void;
}

const SelectSourceChain = 'Select Token';
const SearchByTokenName = 'Search by token name';

export default function TokenSelectModal({
  className,
  open = false,
  tokenList,
  onSelect,
  onClose,
}: TokenSelectModalProps) {
  return (
    <CommonModal
      className={clsx(styles['token-select-modal'], className)}
      title={SelectSourceChain}
      open={open}
      onCancel={onClose}
      hideCancelButton
      hideOkButton>
      <div className={styles['token-search']}>
        <Input
          className={styles['token-search-input']}
          placeholder={SearchByTokenName}
          prefix={<SearchIcon />}
        />
      </div>
      <div className={styles['token-list']}>
        {tokenList.map((item, index) => {
          return (
            <div
              key={'TokenSelectModal-item-' + index}
              onClick={() => onSelect(item)}
              className={clsx('flex-row-center', styles['token-item'])}>
              <SelectImage icon={item.icon} open={true} symbol={formatSymbolDisplay(item.symbol)} />
              <span className={styles['token-item-symbol']}>
                {formatSymbolDisplay(item.symbol)}
              </span>
              <span className={styles['token-item-name']}>{item.name}</span>
            </div>
          );
        })}
      </div>
    </CommonModal>
  );
}
