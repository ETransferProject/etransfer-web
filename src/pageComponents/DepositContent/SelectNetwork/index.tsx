import { Add, DownSmall } from 'assets/images';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TNetworkItem } from 'types/api';
import styles from './styles.module.scss';
import { useAppDispatch, useCommonState, useUserActionState } from 'store/Provider/hooks';
import NetworkSelectDrawer from 'components/SelectNetwork/NetworkSelectDrawer';
import NetworkSelectDropdown from 'components/SelectNetwork/NetworkSelectDropdown';
import clsx from 'clsx';
import { SideMenuKey } from 'constants/home';
import { setAddInitOpenNetworkModalCount } from 'store/reducers/userAction/slice';

type TSelectNetworkProps = {
  label?: string;
  networkList: TNetworkItem[];
  selected?: TNetworkItem;
  isDisabled?: boolean;
  isShowLoading?: boolean;
  onChange?: (item: TNetworkItem) => void;
  selectCallback: (item: TNetworkItem) => Promise<void>;
};

export default function SelectNetwork({
  label,
  networkList,
  selected,
  isDisabled,
  isShowLoading,
  onChange,
  selectCallback,
}: TSelectNetworkProps) {
  const { isMobilePX } = useCommonState();
  const dispatch = useAppDispatch();
  const {
    deposit: { initOpenNetworkModalCount },
  } = useUserActionState();
  const [isShowNetworkSelectDropdown, setIsShowNetworkSelectDropdown] = useState<boolean>(false);

  const onSelectNetwork = useCallback(
    async (item: TNetworkItem) => {
      onChange?.(item);

      setIsShowNetworkSelectDropdown(false);

      await selectCallback(item);
    },
    [onChange, selectCallback],
  );

  useEffect(() => {
    if (
      isMobilePX &&
      networkList &&
      networkList.length > 0 &&
      !selected?.network &&
      initOpenNetworkModalCount === 0
    ) {
      dispatch(setAddInitOpenNetworkModalCount());
      setIsShowNetworkSelectDropdown(true);
    }
  }, [dispatch, initOpenNetworkModalCount, isMobilePX, networkList, selected?.network]);

  const renderNotSelected = useMemo(() => {
    return (
      <div className={clsx('flex-row-center', styles['select-network-not-selected'])}>
        <Add />
        <span className={styles['select-network-value-placeholder']}>Select Network</span>
      </div>
    );
  }, []);

  const renderNetworkLogo = useMemo(() => {
    return (
      <div className={clsx('row-center', styles['network-logo'])}>
        {selected?.network.charAt(0)}
      </div>
      // <div>
      //   {selected?.icon ? (
      //     <div></div>
      //   ) : (
      //     <div className="network-logo">{selected?.network.charAt(0)}</div>
      //   )}
      // </div>
    );
  }, [selected?.network]);

  const renderSelected = useMemo(() => {
    return (
      selected?.network &&
      (isMobilePX ? (
        <span className={clsx('flex-row-center', styles['select-network-value-selected'])}>
          {renderNetworkLogo}
          <span className={styles['primary']}>{selected?.name}</span>
        </span>
      ) : (
        <span className={clsx('flex-row-center', styles['select-network-value-selected'])}>
          {renderNetworkLogo}
          <span className={styles['primary']}>{selected?.network}</span>
          <span className={styles['secondary']}>{selected?.name}</span>
        </span>
      ))
    );
  }, [isMobilePX, renderNetworkLogo, selected?.name, selected?.network]);

  return (
    <div className={styles['deposit-select-network']}>
      <div
        id="select-network-result"
        className={clsx('flex-row-center', styles['select-network-result'])}
        onClick={() => setIsShowNetworkSelectDropdown(true)}>
        <div className={styles['select-network-label']}>{label}</div>
        {selected?.network ? renderSelected : renderNotSelected}
        <div className={clsx('flex-center', styles['select-network-down-icon-wrapper'])}>
          <DownSmall
            className={clsx(styles['select-network-down-icon'], {
              [styles['select-network-down-icon-rotate']]: isShowNetworkSelectDropdown,
            })}
          />
        </div>
      </div>

      {isMobilePX ? (
        <NetworkSelectDrawer
          open={isShowNetworkSelectDropdown}
          onClose={() => setIsShowNetworkSelectDropdown(false)}
          type={SideMenuKey.Deposit}
          networkList={networkList}
          selectedNetwork={selected?.network}
          isDisabled={isDisabled}
          isShowLoading={isShowLoading}
          onSelect={onSelectNetwork}
        />
      ) : (
        <NetworkSelectDropdown
          className={styles['deposit-network-select-dropdown']}
          open={isShowNetworkSelectDropdown}
          type={SideMenuKey.Deposit}
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
