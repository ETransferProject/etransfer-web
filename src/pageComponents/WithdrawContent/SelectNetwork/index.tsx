import { useCallback, useState } from 'react';
import { TNetworkItem } from 'types/api';
import styles from './styles.module.scss';
import { useCommonState } from 'store/Provider/hooks';
import NetworkSelectDrawer from 'components/SelectNetwork/NetworkSelectDrawer';
import NetworkSelectDropdown from 'components/SelectNetwork/NetworkSelectDropdown';
import DynamicArrow from 'components/DynamicArrow';
import clsx from 'clsx';
import { SideMenuKey } from 'constants/home';
import NetworkLogo from 'components/NetworkLogo';

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
  const { isPadPX } = useCommonState();
  const [isShowNetworkSelectDropdown, setIsShowNetworkSelectDropdown] = useState<boolean>(false);

  const onSelectNetwork = useCallback(
    async (item: TNetworkItem) => {
      if (item.network === selected?.network) {
        setIsShowNetworkSelectDropdown(false);
        return;
      }
      onChange?.(item);

      setIsShowNetworkSelectDropdown(false);

      await selectCallback(item);
    },
    [onChange, selectCallback, selected?.network],
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
                {isPadPX ? (
                  <>
                    <NetworkLogo network={selected.network} size="big" />
                    <span className={styles['primary']}>{selected.name}</span>
                  </>
                ) : (
                  <>
                    <NetworkLogo network={selected.network} size="big" />
                    <span className={styles['primary']}>{selected.network}</span>
                    <span className={styles['secondary']}>{selected.name}</span>
                  </>
                )}
              </span>
            ) : (
              <span className={styles['select-network-value-placeholder']}>Select Chain</span>
            )}
          </div>

          <DynamicArrow isExpand={isShowNetworkSelectDropdown} size="Big" />
        </div>
      </div>

      {isPadPX ? (
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
