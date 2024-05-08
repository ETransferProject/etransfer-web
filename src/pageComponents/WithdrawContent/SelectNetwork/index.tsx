import { useCallback, useState } from 'react';
import { TNetworkItem } from 'types/api';
import styles from './styles.module.scss';
import { useCommonState } from 'store/Provider/hooks';
import NetworkSelectDrawer from 'components/SelectNetwork/NetworkSelectDrawer';
import NetworkSelectDropdown from 'components/SelectNetwork/NetworkSelectDropdown';
import DownBigIcon from 'assets/images/downBig.svg';
import clsx from 'clsx';
import { SideMenuKey } from 'constants/home';

type TSelectNetworkProps = {
  networkList: TNetworkItem[];
  selected?: TNetworkItem;
  isDisabled?: boolean;
  isShowLoading?: boolean;
  onChange?: (item: TNetworkItem) => void;
  selectCallback: (item: TNetworkItem) => Promise<void>;
};

export default function SelectNetwork({
  networkList,
  selected,
  isDisabled,
  isShowLoading,
  onChange,
  selectCallback,
}: TSelectNetworkProps) {
  const { isMobilePX } = useCommonState();
  const [isShowNetworkSelectDropdown, setIsShowNetworkSelectDropdown] = useState<boolean>(false);

  const onSelectNetwork = useCallback(
    async (item: TNetworkItem) => {
      onChange?.(item);

      setIsShowNetworkSelectDropdown(false);

      await selectCallback(item);
    },
    [onChange, selectCallback],
  );

  return (
    <div className={styles['withdraw-select-network']}>
      <div
        id="select-network-result"
        className={clsx(styles['select-network-result'], styles['select-network-result-form-item'])}
        onClick={() => setIsShowNetworkSelectDropdown(true)}>
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

          <DownBigIcon
            className={clsx({
              [styles['select-network-down-icon-rotate']]: isShowNetworkSelectDropdown,
            })}
          />
        </div>
      </div>

      {isMobilePX ? (
        <NetworkSelectDrawer
          open={isShowNetworkSelectDropdown}
          onClose={() => setIsShowNetworkSelectDropdown(false)}
          type={SideMenuKey.Withdraw}
          networkList={networkList}
          selectedNetwork={selected?.network}
          isDisabled={isDisabled}
          isShowLoading={isShowLoading}
          onSelect={onSelectNetwork}
        />
      ) : (
        <NetworkSelectDropdown
          isFormItemStyle
          open={isShowNetworkSelectDropdown}
          type={SideMenuKey.Withdraw}
          networkList={networkList}
          selectedNetwork={selected?.network}
          isDisabled={isDisabled}
          isShowLoading={isShowLoading}
          onSelect={onSelectNetwork}
          onClose={() => setIsShowNetworkSelectDropdown(false)}
        />
      )}
    </div>
  );
}
