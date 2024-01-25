import { Swap } from 'assets/images';
import { useEffect, useState } from 'react';
import { NetworkItem } from 'types/api';
import styles from './styles.module.scss';
import { useAppDispatch, useCommonState, useUserActionState } from 'store/Provider/hooks';
import NetworkSelectDrawer from 'pageComponents/NetworkSelectDrawer';
import NetworkSelectDropdown from 'pageComponents/NetworkSelectDropdown';
import Down from 'assets/images/down.svg';
import clsx from 'clsx';
import { SideMenuKey } from 'constants/home';
import { setAddInitOpenNetworkModalCount } from 'store/reducers/userAction/slice';

type NetworkSelectProps = {
  isFormItemStyle?: boolean;
  type: SideMenuKey;
  networkList: NetworkItem[];
  selected?: NetworkItem;
  noBorder?: boolean;
  isDisabled?: boolean;
  onChange?: (item: NetworkItem) => void;
  selectCallback: (item: NetworkItem) => Promise<void>;
};

export default function SelectNetwork({
  isFormItemStyle,
  type,
  networkList,
  selected,
  noBorder,
  isDisabled,
  onChange,
  selectCallback,
}: NetworkSelectProps) {
  const { isMobilePX } = useCommonState();
  const dispatch = useAppDispatch();
  const {
    deposit: { initOpenNetworkModalCount },
  } = useUserActionState();
  const [isShowNetworkSelectDropdown, setIsShowNetworkSelectDropdown] = useState<boolean>(false);

  const onSelectNetwork = async (item: NetworkItem) => {
    if (onChange) {
      onChange(item);
    }
    // else {
    //   setSelected(item);
    // }

    setIsShowNetworkSelectDropdown(false);

    await selectCallback(item);
  };

  useEffect(() => {
    if (
      type === SideMenuKey.Deposit &&
      isMobilePX &&
      networkList &&
      networkList.length > 0 &&
      !selected?.network &&
      initOpenNetworkModalCount === 0
    ) {
      dispatch(setAddInitOpenNetworkModalCount());
      setIsShowNetworkSelectDropdown(true);
    }
  }, [dispatch, initOpenNetworkModalCount, isMobilePX, networkList, selected?.network, type]);

  return (
    <div className={styles['select-network']}>
      <div
        id="select-network-result"
        className={clsx(styles['select-network-result'], {
          [styles['select-network-result-form-item']]: isFormItemStyle,
          [styles['select-network-result-no-border']]: noBorder,
        })}
        onClick={() => setIsShowNetworkSelectDropdown(true)}>
        {!isFormItemStyle && <div className={styles['select-network-label']}>Deposit Network</div>}
        <div className={styles['select-network-value-row']}>
          <div className={styles['select-network-value']}>
            {selected?.network ? (
              <span className={clsx('flex-row-center', styles['select-network-value-selected'])}>
                {isMobilePX ? (
                  <span className={styles['primary']}>{selected.name}</span>
                ) : (
                  <>
                    <span className={styles['primary']}>{selected.network}</span>
                    <span className={styles['secondary']}>{selected.name}</span>
                  </>
                )}
              </span>
            ) : (
              <span className={styles['select-network-value-placeholder']}>Select network</span>
            )}
          </div>
          {isFormItemStyle ? (
            <Down
              className={clsx({
                [styles['select-network-down-icon-rotate']]: isShowNetworkSelectDropdown,
              })}
            />
          ) : (
            <div className={clsx('flex-center', styles['select-network-swap-icon-wrapper'])}>
              <Swap className={styles['select-network-swap-icon']} />
            </div>
          )}
        </div>
      </div>

      {isMobilePX ? (
        <NetworkSelectDrawer
          open={isShowNetworkSelectDropdown}
          onClose={() => setIsShowNetworkSelectDropdown(false)}
          type={type}
          networkList={networkList}
          selectedNetwork={selected?.network}
          isDisabled={isDisabled}
          onSelect={onSelectNetwork}
        />
      ) : (
        <NetworkSelectDropdown
          isFormItemStyle={isFormItemStyle}
          open={isShowNetworkSelectDropdown}
          type={type}
          networkList={networkList}
          selectedNetwork={selected?.network}
          isDisabled={isDisabled}
          onSelect={onSelectNetwork}
          onClose={() => setIsShowNetworkSelectDropdown(false)}
        />
      )}
    </div>
  );
}
