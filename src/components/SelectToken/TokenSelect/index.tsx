import clsx from 'clsx';
import styles from './styles.module.scss';
import { SideMenuKey } from 'constants/home';
import { TokenCardForMobile, TokenCardForWeb } from 'components/SelectToken/TokenCard';
import { TDepositTokenItem } from 'types/api';
import { SupportedELFChainId } from 'constants/index';

export type TTokenListAndBalance = Array<
  TDepositTokenItem & { balance?: string; balanceUsd?: string }
>;

export interface TokenSelectProps {
  className?: string;
  itemClassName?: string;
  type: SideMenuKey;
  chainId?: SupportedELFChainId;
  tokenList?: TTokenListAndBalance;
  selectedToken?: string;
  isDisabled?: boolean;
  isShowLoading?: boolean;
  isShowBalance?: boolean;
  open: boolean;
  onSelect: (item: TDepositTokenItem) => Promise<void>;
}

export function TokenSelectForMobile({
  className,
  itemClassName,
  type,
  chainId,
  tokenList,
  selectedToken,
  isDisabled,
  isShowBalance = false,
  open,
  onSelect,
}: TokenSelectProps) {
  return (
    <div className={clsx(styles['token-select'], styles['token-select-for-mobile'], className)}>
      <div className={styles['token-select-list']}>
        {tokenList?.map((item, idx) => {
          return (
            <TokenCardForMobile
              key={'token-select' + item.symbol + idx}
              className={clsx(
                selectedToken == item.symbol && styles['token-card-selected'],
                itemClassName,
              )}
              type={type}
              isDisabled={isDisabled}
              name={item?.name || ''}
              icon={item.icon}
              symbol={item.symbol}
              open={open}
              isShowBalance={isShowBalance}
              decimals={item.decimals}
              chainId={chainId}
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
  itemClassName,
  chainId,
  tokenList,
  selectedToken,
  isDisabled,
  isShowBalance,
  onSelect,
  open,
}: TokenSelectProps) {
  return (
    <div className={clsx(styles['token-select'], styles['token-select-for-web'], className)}>
      <div className={styles['token-select-list']}>
        {tokenList?.map((item, idx) => {
          return (
            <TokenCardForWeb
              key={'token-select' + item.symbol + idx}
              className={clsx(
                selectedToken == item.symbol && styles['token-card-selected'],
                itemClassName,
              )}
              isDisabled={isDisabled}
              icon={item.icon}
              name={item?.name || ''}
              symbol={item.symbol}
              open={open}
              isShowBalance={isShowBalance}
              decimals={item.decimals}
              chainId={chainId}
              onClick={() => onSelect(item)}
            />
          );
        })}
      </div>
    </div>
  );
}
