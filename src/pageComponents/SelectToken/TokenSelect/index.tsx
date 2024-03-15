import clsx from 'clsx';
import styles from './styles.module.scss';
import { SideMenuKey } from 'constants/home';
import { TokenCardForMobile, TokenCardForWeb } from 'pageComponents/SelectToken/TokenCard';
import { TokenItem } from 'types/api';

export interface TokenSelectProps {
  className?: string;
  type: SideMenuKey;
  tokenList: TokenItem[];
  selectedToken?: string;
  isDisabled?: boolean;
  isShowLoading?: boolean;
  open: boolean;
  onSelect: (item: TokenItem) => Promise<void>;
}

export function TokenSelectForMobile({
  className,
  type,
  tokenList,
  selectedToken,
  isDisabled,
  open,
  onSelect,
}: TokenSelectProps) {
  return (
    <div className={clsx(styles['token-select'], styles['token-select-for-mobile'], className)}>
      <div className={styles['token-select-list']}>
        {tokenList.map((item, idx) => {
          return (
            <TokenCardForMobile
              key={'token-select' + item.symbol + idx}
              className={selectedToken == item.symbol ? styles['token-card-selected'] : undefined}
              type={type}
              isDisabled={isDisabled}
              name={item.name}
              icon={item.icon}
              symbol={item.symbol}
              open={open}
              onClick={() => onSelect(item)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function TokenSelectForWeb({
  className,
  tokenList,
  selectedToken,
  isDisabled,
  onSelect,
  open,
}: TokenSelectProps) {
  return (
    <div className={clsx(styles['token-select'], styles['token-select-for-web'], className)}>
      <div className={styles['token-select-list']}>
        {tokenList.map((item, idx) => {
          return (
            <TokenCardForWeb
              key={'token-select' + item.symbol + idx}
              className={selectedToken == item.symbol ? styles['token-card-selected'] : undefined}
              isDisabled={isDisabled}
              icon={item.icon}
              name={item.name}
              symbol={item.symbol}
              open={open}
              onClick={() => onSelect(item)}
            />
          );
        })}
      </div>
    </div>
  );
}
