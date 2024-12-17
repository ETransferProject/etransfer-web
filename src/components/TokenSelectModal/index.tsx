import { useMemo, useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { Input } from 'antd';
import CommonModal from 'components/CommonModal';
import CommonDrawer from 'components/CommonDrawer';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import { SelectImage } from 'components/SelectToken/TokenCard';
import { formatSymbolDisplay } from 'utils/format';
import { AddBlueIcon, SearchIcon } from 'assets/images';
import { useCommonState } from 'store/Provider/hooks';
import { useRouter } from 'next/navigation';
import styles from './styles.module.scss';

type TToken<T> = T & {
  name: string;
  symbol: string;
  icon: string;
};

export interface TokenSelectModalProps<T> {
  className?: string;
  open: boolean;
  hideAddToken?: boolean;
  tokenList: TToken<T>[];
  onSelect: (item: TToken<T>) => Promise<void>;
  onClose: () => void;
}

const SelectSourceChain = 'Select Token';
const SearchByTokenName = 'Search by token name';

export default function TokenSelectModal<T>({
  className,
  open = false,
  hideAddToken = false,
  tokenList,
  onSelect,
  onClose,
}: TokenSelectModalProps<T>) {
  const { isPadPX } = useCommonState();
  const router = useRouter();
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

  const handleAddToken = useCallback(() => {
    router.push('/listing/token-information');
  }, [router]);

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
        {!hideAddToken && (
          <CommonButton
            className={styles['token-select-button']}
            type={CommonButtonType.Secondary}
            icon={<AddBlueIcon />}
            onClick={handleAddToken}>
            Add Token
          </CommonButton>
        )}
      </>
    );
  }, [filteredTokenList, onSelect, searchKeyword, handleAddToken, hideAddToken]);

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
