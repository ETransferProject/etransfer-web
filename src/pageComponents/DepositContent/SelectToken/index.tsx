import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import { useAppDispatch, useCommonState, useDepositState } from 'store/Provider/hooks';
import TokenSelectDrawer from 'components/SelectToken/TokenSelectDrawer';
import TokenSelectDropdown from 'components/SelectToken/TokenSelectDropdown';
import { AddBigIcon } from 'assets/images';
import clsx from 'clsx';
import { SideMenuKey } from 'constants/home';
import { SelectImage } from 'components/SelectToken/TokenCard';
import { TDepositTokenItem } from 'types/api';
import { setAddInitOpenTokenModalCount } from 'store/reducers/deposit/slice';
import DynamicArrow from 'components/DynamicArrow';
import { formatSymbolDisplay } from 'utils/format';

type TSelectTokenProps = {
  tokenList?: TDepositTokenItem[];
  selected?: TDepositTokenItem;
  isDisabled?: boolean;
  isShowLoading?: boolean;
  onChange?: (item: TDepositTokenItem) => void;
  selectCallback: (item: TDepositTokenItem) => void;
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
  const { initOpenTokenModalCount } = useDepositState();
  const [isShowTokenSelectDropdown, setIsShowTokenSelectDropdown] = useState<boolean>(false);
  const symbolFormat = useMemo(
    () => formatSymbolDisplay(selected?.symbol || ''),
    [selected?.symbol],
  );

  const onSelectToken = useCallback(
    async (item: TDepositTokenItem) => {
      if (item.symbol === selected?.symbol) {
        setIsShowTokenSelectDropdown(false);
        return;
      }
      onChange?.(item);
      setIsShowTokenSelectDropdown(false);

      selectCallback(item);
    },
    [onChange, selectCallback, selected?.symbol],
  );

  useEffect(() => {
    if (
      isPadPX &&
      tokenList &&
      tokenList.length > 0 &&
      !selected?.symbol &&
      initOpenTokenModalCount === 0
    ) {
      dispatch(setAddInitOpenTokenModalCount());
      setIsShowTokenSelectDropdown(true);
    }
  }, [dispatch, initOpenTokenModalCount, tokenList, isPadPX, selected?.symbol]);

  const renderNotSelected = useMemo(() => {
    return (
      <div className={clsx('flex-row-center', styles['select-token-not-selected'])}>
        <AddBigIcon />
        <span className={styles['select-token-value-placeholder']}>Select Token</span>
      </div>
    );
  }, []);

  return (
    <div className={styles['deposit-select-token']}>
      <div
        id="select-token-result"
        className={clsx(styles['select-token-result'])}
        onClick={() => setIsShowTokenSelectDropdown(true)}>
        <div className={styles['select-token-value-row']}>
          {selected?.symbol ? (
            <span className={clsx('flex-row-center', styles['select-token-value-selected'])}>
              <SelectImage open={true} symbol={symbolFormat} icon={selected.icon} size={28} />
              <span className={styles['primary']}>{symbolFormat}</span>
              <span className={styles['secondary']}>{selected.name}</span>
            </span>
          ) : (
            renderNotSelected
          )}
          <DynamicArrow isExpand={isShowTokenSelectDropdown} />
        </div>
      </div>

      {isPadPX ? (
        <TokenSelectDrawer
          open={isShowTokenSelectDropdown}
          onClose={() => setIsShowTokenSelectDropdown(false)}
          type={SideMenuKey.Deposit}
          tokenList={tokenList}
          selectedToken={selected?.symbol}
          isDisabled={isDisabled}
          isShowLoading={isShowLoading}
          onSelect={onSelectToken}
        />
      ) : (
        <TokenSelectDropdown
          className={styles['deposit-token-select-dropdown']}
          open={isShowTokenSelectDropdown}
          type={SideMenuKey.Deposit}
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
