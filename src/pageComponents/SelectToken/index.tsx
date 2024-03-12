import { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { useAppDispatch, useCommonState, useUserActionState } from 'store/Provider/hooks';
import TokenSelectDrawer from 'pageComponents/SelectToken/TokenSelectDrawer';
import TokenSelectDropdown from 'pageComponents/SelectToken/TokenSelectDropdown';
import Down from 'assets/images/down.svg';
import clsx from 'clsx';
import { SideMenuKey } from 'constants/home';

import { BusinessType, TokenItem } from 'types/api';
import { setCurrentSymbol } from 'store/reducers/token/slice';
import CommonImage from 'components/CommonImage';
import { setAddInitOpenTokenModalCount } from 'store/reducers/userAction/slice';

type TokenSelectProps = {
  isFormItemStyle?: boolean;
  type: SideMenuKey;
  tokenList: TokenItem[];
  selected?: TokenItem;
  noBorder?: boolean;
  isDisabled?: boolean;
  isShowLoading?: boolean;
  onChange?: (item: TokenItem) => void;
  selectCallback: (item: TokenItem) => void;
};

export default function SelectToken({
  isFormItemStyle,
  type,
  tokenList,
  selected,
  noBorder,
  isDisabled,
  isShowLoading,
  onChange,
  selectCallback,
}: TokenSelectProps) {
  const { isMobilePX } = useCommonState();
  const dispatch = useAppDispatch();
  const {
    deposit: { initOpenTokenkModalCount },
  } = useUserActionState();
  const [isShowTokenSelectDropdown, setIsShowTokenSelectDropdown] = useState<boolean>(false);
  const { activeMenuKey } = useCommonState();

  const onSelectToken = async (item: TokenItem) => {
    if (onChange) {
      onChange(item);
    }
    dispatch(
      setCurrentSymbol({ key: activeMenuKey as unknown as BusinessType, symbol: item.symbol }),
    );
    setIsShowTokenSelectDropdown(false);

    selectCallback(item);
  };

  useEffect(() => {
    if (
      type === SideMenuKey.Deposit &&
      isMobilePX &&
      tokenList &&
      tokenList.length > 0 &&
      !selected?.symbol &&
      initOpenTokenkModalCount === 0
    ) {
      dispatch(setAddInitOpenTokenModalCount());
      setIsShowTokenSelectDropdown(true);
    }
  }, [dispatch, initOpenTokenkModalCount, tokenList, isMobilePX, selected?.symbol, type]);

  return (
    <div className={styles['select-token']}>
      <div
        id="select-token-result"
        className={clsx(styles['select-token-result'], {
          [styles['select-token-result-form-item']]: isFormItemStyle,
          [styles['select-token-result-no-border']]: noBorder,
        })}
        onClick={() => setIsShowTokenSelectDropdown(true)}>
        {!isFormItemStyle && <div className={styles['select-token-label']}>Deposit token</div>}
        <div className={styles['select-token-value-row']}>
          <div className={styles['select-token-value']}>
            {selected?.symbol ? (
              <span className={clsx('flex-row-center', styles['select-token-value-selected'])}>
                {selected.icon ? (
                  <CommonImage src={selected.icon} alt="token" className={styles['icon']} />
                ) : (
                  <div className={clsx(styles['default'], styles['icon'])}>
                    {selected.symbol.charAt(0)}
                  </div>
                )}
                <span className={styles['primary']}>{selected.symbol}</span>
                <span className={styles['secondary']}>{selected.name}</span>
              </span>
            ) : (
              <span className={styles['select-token-value-placeholder']}>Select a token</span>
            )}
          </div>
          {isFormItemStyle ? (
            <Down
              className={clsx({
                [styles['select-token-down-icon-rotate']]: isShowTokenSelectDropdown,
              })}
            />
          ) : (
            <div className={clsx('flex-center', styles['select-token-swap-icon-wrapper'])}>
              <Down className={styles['select-token-swap-icon']} />
            </div>
          )}
        </div>
      </div>

      {isMobilePX ? (
        <TokenSelectDrawer
          open={isShowTokenSelectDropdown}
          onClose={() => setIsShowTokenSelectDropdown(false)}
          type={type}
          tokenList={tokenList}
          selectedToken={selected?.symbol}
          isDisabled={isDisabled}
          isShowLoading={isShowLoading}
          onSelect={onSelectToken}
        />
      ) : (
        <TokenSelectDropdown
          isFormItemStyle={isFormItemStyle}
          open={isShowTokenSelectDropdown}
          type={type}
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
