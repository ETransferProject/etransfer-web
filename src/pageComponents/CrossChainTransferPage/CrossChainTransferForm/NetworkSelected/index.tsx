import clsx from 'clsx';
import styles from './styles.module.scss';
import NetworkLogo from 'components/NetworkLogo';
import { useCallback, useMemo, useState } from 'react';
import { TNetworkItem } from 'types/api';
import DynamicArrow from 'components/DynamicArrow';
import NetworkSelectModal from 'components/NetworkSelectModal';
import { NO_MATCHING_NETWORK } from 'constants/crossChainTransfer';

export interface NetworkSelectedProps {
  className?: string;
  modalTitle: string;
  selected?: TNetworkItem;
  networkList: TNetworkItem[];
  onChange?: (item: TNetworkItem) => void;
  selectCallback?: (item: TNetworkItem) => Promise<void>;
}

export default function NetworkSelected({
  className,
  modalTitle,
  selected,
  networkList,
  onChange,
  selectCallback,
}: NetworkSelectedProps) {
  const [isShowNetworkSelectModal, setIsShowNetworkSelectModal] = useState<boolean>(false);

  const onSelectNetwork = useCallback(
    async (item: TNetworkItem) => {
      if (item.network === selected?.network) {
        setIsShowNetworkSelectModal(false);
        return;
      }
      onChange?.(item);

      setIsShowNetworkSelectModal(false);

      await selectCallback?.(item);
    },
    [onChange, selectCallback, selected?.network],
  );

  const openModal = useCallback(() => {
    if (!networkList || networkList.length === 0) return;
    setIsShowNetworkSelectModal(true);
  }, [networkList]);

  const renderNetworkLogo = useMemo(() => {
    return (
      selected?.network && (
        <NetworkLogo className="flex-shrink-0 flex" network={selected?.network} size={'big'} />
      )
    );
  }, [selected?.network]);

  const renderSelected = useMemo(() => {
    return selected?.network ? (
      <span className={clsx('flex-row-center gap-8', styles['select-network-value-selected'])}>
        {renderNetworkLogo}
        <span className={styles['select-network-value-selected-name']}>{selected?.name}</span>
      </span>
    ) : (
      <span className={clsx(styles['select-network-value-selected-name'], styles['no-network'])}>
        {NO_MATCHING_NETWORK}
      </span>
    );
  }, [renderNetworkLogo, selected?.name, selected?.network]);

  return (
    <>
      <div
        className={clsx(
          'flex-row-center-between gap-8 cursor-pointer',
          styles['network-selected'],
          (!networkList || networkList.length === 0) && styles['network-selected-disable'],
          className,
        )}
        onClick={openModal}>
        {renderSelected}
        <DynamicArrow
          size={'Normal'}
          isExpand={isShowNetworkSelectModal}
          iconClassName={selected?.network ? '' : styles['dynamic-arrow-disable']}
        />
      </div>

      <NetworkSelectModal
        modalTitle={modalTitle}
        open={isShowNetworkSelectModal}
        networkList={networkList}
        onSelect={onSelectNetwork}
        onClose={() => setIsShowNetworkSelectModal(false)}
      />
    </>
  );
}
