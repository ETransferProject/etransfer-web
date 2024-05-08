import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import { useAppDispatch, useCommonState, useUserActionState } from 'store/Provider/hooks';
import TokenSelectDrawer from 'components/SelectToken/TokenSelectDrawer';
import TokenSelectDropdown from 'components/SelectToken/TokenSelectDropdown';
import { AddBig, Down } from 'assets/images';
import clsx from 'clsx';
import { SideMenuKey } from 'constants/home';
import { SelectImage } from 'components/SelectToken/TokenCard';
import { BusinessType, TTokenItem } from 'types/api';
import { setCurrentSymbol } from 'store/reducers/token/slice';
import { setAddInitOpenTokenModalCount } from 'store/reducers/userAction/slice';

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
  const { isMobilePX } = useCommonState();
  const dispatch = useAppDispatch();
  const {
    deposit: { initOpenTokenModalCount },
  } = useUserActionState();
  const [isShowTokenSelectDropdown, setIsShowTokenSelectDropdown] = useState<boolean>(false);

  const onSelectToken = useCallback(
    async (item: TTokenItem) => {
      onChange?.(item);
      dispatch(setCurrentSymbol({ key: BusinessType.Deposit, symbol: item.symbol }));
      setIsShowTokenSelectDropdown(false);

      selectCallback(item);
    },
    [dispatch, onChange, selectCallback],
  );

  useEffect(() => {
    if (
      isMobilePX &&
      tokenList &&
      tokenList.length > 0 &&
      !selected?.symbol &&
      initOpenTokenModalCount === 0
    ) {
      dispatch(setAddInitOpenTokenModalCount());
      setIsShowTokenSelectDropdown(true);
    }
  }, [dispatch, initOpenTokenModalCount, tokenList, isMobilePX, selected?.symbol]);

  const renderNotSelected = useMemo(() => {
    return (
      <div className={clsx('flex-row-center', styles['select-token-not-selected'])}>
        <AddBig />
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
              <SelectImage open={true} symbol={selected.symbol} icon={selected.icon} />
              <span className={styles['primary']}>{selected.symbol}</span>
              <span className={styles['secondary']}>{selected.name}</span>
            </span>
          ) : (
            renderNotSelected
          )}

          <div className={clsx('flex-center', styles['select-token-down-icon-wrapper'])}>
            <Down
              className={clsx(styles['select-token-down-icon'], {
                [styles['select-token-down-icon-rotate']]: isShowTokenSelectDropdown,
              })}
            />
          </div>
        </div>
      </div>

      {isMobilePX ? (
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
