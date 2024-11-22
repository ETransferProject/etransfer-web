import { useMemo, useState, useEffect } from 'react';
import CommonModal from 'components/CommonModal';
import styles from './styles.module.scss';
import { Input } from 'antd';
import { TTokenItem } from 'types/api';
import { SelectImage } from 'components/SelectToken/TokenCard';
import { formatSymbolDisplay } from 'utils/format';
import clsx from 'clsx';
import { SearchIcon } from 'assets/images';
import CommonDrawer from 'components/CommonDrawer';
import { useCommonState } from 'store/Provider/hooks';

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
  const { isPadPX } = useCommonState();
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!open) {
      setSearchKeyword('');
    }
  }, [open]);

  const filteredTokenList = useMemo(() => {
    if (!searchKeyword) return tokenList;

    const keyword = searchKeyword.toLowerCase();
    return tokenList.filter((item) => item.symbol.toLowerCase().includes(keyword));
  }, [tokenList, searchKeyword]);

  const content = useMemo(() => {
    return (
      <>
        <div className={styles['token-search']}>
          <Input
            className={styles['token-search-input']}
            placeholder={SearchByTokenName}
            prefix={<SearchIcon />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
        <div className={styles['token-list']}>
          {filteredTokenList.map((item, index) => {
            return (
              <div
                key={'TokenSelectModal-item-' + index}
                onClick={() => onSelect(item)}
                className={clsx('flex-row-center', styles['token-item'])}>
                <SelectImage
                  icon={item.icon}
                  open={true}
                  symbol={formatSymbolDisplay(item.symbol)}
                />
                <span className={styles['token-item-symbol']}>
                  {formatSymbolDisplay(item.symbol)}
                </span>
                <span className={styles['token-item-name']}>{item.name}</span>
              </div>
            );
          })}
        </div>
      </>
    );
  }, [filteredTokenList, onSelect, searchKeyword]);

  if (isPadPX) {
    return (
      <CommonDrawer
        className={clsx(
          styles['token-select-drawer'],
          styles['token-select-drawer-weight'],
          className,
        )}
        height="80%"
        title={SelectSourceChain}
        open={open}
        onClose={onClose}>
        {content}
      </CommonDrawer>
    );
  }

  return (
    <CommonModal
      className={clsx(styles['token-select-modal'], className)}
      title={SelectSourceChain}
      open={open}
      onCancel={onClose}
      hideCancelButton
      hideOkButton>
      {content}
    </CommonModal>
  );
}
