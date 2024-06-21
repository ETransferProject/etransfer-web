import { useCallback, useState } from 'react';
import styles from './styles.module.scss';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import TokenSelectDrawer from 'components/SelectToken/TokenSelectDrawer';
import TokenSelectDropdown from 'components/SelectToken/TokenSelectDropdown';
import DynamicArrow from 'components/DynamicArrow';
import clsx from 'clsx';
import { SideMenuKey } from 'constants/home';
import { SelectImage } from 'components/SelectToken/TokenCard';
import { TTokenItem } from 'types/api';
import { setCurrentSymbol } from 'store/reducers/withdraw/slice';
import { formatSymbolDisplay } from 'utils/format';

type TSelectTokenProps = {
  tokenList: TTokenItem[];
  selected?: TTokenItem;
  isDisabled?: boolean;
  isShowLoading?: boolean;
  onChange?: (item: TTokenItem) => void;
  selectCallback: (item: TTokenItem) => void;
};

export default function SelectToken({
  tokenList,
  selected,
  isDisabled,
  isShowLoading,
  onChange,
  selectCallback,
}: TSelectTokenProps) {
  const { isPadPX } = useCommonState();
  const dispatch = useAppDispatch();
  const [isShowTokenSelectDropdown, setIsShowTokenSelectDropdown] = useState<boolean>(false);

  const onSelectToken = useCallback(
    async (item: TTokenItem) => {
      if (item.symbol === selected?.symbol) {
        setIsShowTokenSelectDropdown(false);
        return;
      }
      onChange?.(item);
      dispatch(setCurrentSymbol(item.symbol));
      setIsShowTokenSelectDropdown(false);

      selectCallback(item);
    },
    [dispatch, onChange, selectCallback, selected?.symbol],
  );

  return (
    <div className={styles['withdraw-select-token']}>
      <div
        id="select-token-result"
        className={clsx(styles['select-token-result'], styles['select-token-result-form-item'])}
        onClick={() => setIsShowTokenSelectDropdown(true)}>
        <div className={styles['select-token-value-row']}>
          <div className={styles['select-token-value']}>
            {selected?.symbol ? (
              <span className={clsx('flex-row-center', styles['select-token-value-selected'])}>
                <SelectImage
                  open={true}
                  symbol={formatSymbolDisplay(selected.symbol)}
                  icon={selected.icon}
                />
                <span className={styles['primary']}>{formatSymbolDisplay(selected.symbol)}</span>
                <span className={styles['secondary']}>{selected.name}</span>
              </span>
            ) : (
              <span className={styles['select-token-value-placeholder']}>Select a token</span>
            )}
          </div>
          <DynamicArrow isExpand={isShowTokenSelectDropdown} size="Big" />
        </div>
      </div>

      {isPadPX ? (
        <TokenSelectDrawer
          open={isShowTokenSelectDropdown}
          onClose={() => setIsShowTokenSelectDropdown(false)}
          type={SideMenuKey.Withdraw}
          tokenList={tokenList}
          selectedToken={selected?.symbol}
          isDisabled={isDisabled}
          isShowLoading={isShowLoading}
          onSelect={onSelectToken}
        />
      ) : (
        <TokenSelectDropdown
          isFormItemStyle
          open={isShowTokenSelectDropdown}
          type={SideMenuKey.Withdraw}
          tokenList={tokenList}
          selectedToken={selected?.symbol}
          isDisabled={isDisabled}
          isShowLoading={isShowLoading}
          onSelect={onSelectToken}
          onClose={() => setIsShowTokenSelectDropdown(false)}
        />
      )}
    </div>
  );
}
