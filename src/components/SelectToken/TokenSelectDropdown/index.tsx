import clsx from 'clsx';
import styles from './styles.module.scss';
import { TokenSelectForWeb, TokenSelectProps } from 'components/SelectToken/TokenSelect';
import { SideMenuKey } from 'constants/home';

interface TokenSelectDropdownProps extends TokenSelectProps {
  listClassName?: string;
  isFormItemStyle?: boolean;
  type: SideMenuKey;
  open: boolean;
  onClose: () => void;
}

export default function TokenSelectDropdown({
  className,
  listClassName,
  itemClassName,
  isFormItemStyle,
  type,
  chainId,
  open = false,
  tokenList,
  selectedToken,
  isDisabled,
  isShowLoading,
  isShowBalance,
  onSelect,
  onClose,
}: TokenSelectDropdownProps) {
  return (
    <div className={styles['token-select-dropdown']}>
      <div
        className={clsx(
          styles['token-select-dropdown-mask'],
          open ? styles['token-select-dropdown-show'] : styles['token-select-dropdown-hidden'],
        )}
        onClick={onClose}></div>
      <div
        className={clsx(
          styles['token-select-dropdown'],
          { [styles['token-select-dropdown-form-item']]: isFormItemStyle },
          open ? styles['token-select-dropdown-show'] : styles['token-select-dropdown-hidden'],
          className,
        )}>
        <TokenSelectForWeb
          className={listClassName}
          itemClassName={itemClassName}
          open={open}
          type={type}
          chainId={chainId}
          tokenList={tokenList}
          selectedToken={selectedToken}
          onSelect={onSelect}
          isDisabled={isDisabled}
          isShowLoading={isShowLoading}
          isShowBalance={isShowBalance}
        />
      </div>
    </div>
  );
}
