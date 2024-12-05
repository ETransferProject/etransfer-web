import { AddIcon, AddMedium } from 'assets/images';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TNetworkItem } from 'types/api';
import styles from './styles.module.scss';
import { useAppDispatch, useCommonState, useDepositState } from 'store/Provider/hooks';
import clsx from 'clsx';
import { setAddInitOpenNetworkModalCount } from 'store/reducers/deposit/slice';
import DynamicArrow from 'components/DynamicArrow';
import NetworkLogo from 'components/NetworkLogo';
import NetworkSelectModal from 'components/NetworkSelectModal';

type TSelectNetworkProps = {
  label?: string;
  networkList: TNetworkItem[];
  selected?: TNetworkItem;
  className?: string;
  onChange?: (item: TNetworkItem) => void;
  selectCallback: (item: TNetworkItem) => Promise<void>;
};

const DEPOSIT_TIP_CONTENT =
  'Note: Please select from the supported networks listed below. Sending tokens from other networks may result in the loss of your assets.';

export default function SelectNetwork({
  label,
  networkList,
  selected,
  className,
  onChange,
  selectCallback,
}: TSelectNetworkProps) {
  const { isPadPX } = useCommonState();
  const dispatch = useAppDispatch();
  const { initOpenNetworkModalCount } = useDepositState();
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

  useEffect(() => {
    if (
      isPadPX &&
      networkList &&
      networkList.length > 0 &&
      !selected?.network &&
      initOpenNetworkModalCount === 0
    ) {
      dispatch(setAddInitOpenNetworkModalCount());
      setIsShowNetworkSelectDropdown(true);
    }
  }, [dispatch, initOpenNetworkModalCount, isPadPX, networkList, selected?.network]);

  const renderNotSelected = useMemo(() => {
    return (
      <div className={clsx('flex-row-center', styles['select-network-not-selected'])}>
        {isPadPX ? <AddIcon className="flex-shrink-0" /> : <AddMedium className="flex-shrink-0" />}
        <span className={styles['select-network-value-placeholder']}>Select Network</span>
      </div>
    );
  }, [isPadPX]);

  const renderNetworkLogo = useMemo(() => {
    return (
      selected?.network && (
        <NetworkLogo
          className="flex-shrink-0 flex"
          network={selected?.network}
          size={isPadPX ? 'small' : 'big'}
        />
      )
    );
  }, [isPadPX, selected?.network]);

  const renderSelected = useMemo(() => {
    return (
      selected?.network && (
        <span className={clsx('flex-row-center', styles['select-network-value-selected'])}>
          {renderNetworkLogo}
          <span className={styles['primary']}>{selected?.name}</span>
        </span>
      )
    );
  }, [renderNetworkLogo, selected?.name, selected?.network]);

  return (
    <div className={clsx(styles['deposit-select-network'], className)}>
      <div
        id="select-network-result"
        className={clsx(
          isPadPX ? 'flex-row-center' : 'flex-row-center-between',
          styles['select-network-result'],
        )}
        onClick={() => setIsShowNetworkSelectDropdown(true)}>
        {isPadPX && <div className={styles['select-network-label']}>{label}</div>}
        {selected?.network ? renderSelected : renderNotSelected}
        <DynamicArrow size={isPadPX ? 'Small' : 'Normal'} isExpand={isShowNetworkSelectDropdown} />
      </div>

      <NetworkSelectModal
        open={isShowNetworkSelectDropdown}
        onClose={() => setIsShowNetworkSelectDropdown(false)}
        networkList={networkList}
        onSelect={onSelectNetwork}
        remindContent={DEPOSIT_TIP_CONTENT}
      />
    </div>
  );
}
