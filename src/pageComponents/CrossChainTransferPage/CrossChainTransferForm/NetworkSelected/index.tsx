import clsx from 'clsx';
import styles from './styles.module.scss';
import NetworkLogo from 'components/NetworkLogo';
import { useCallback, useMemo, useState } from 'react';
import { TNetworkItem } from 'types/api';
import { useCommonState } from 'store/Provider/hooks';
import DynamicArrow from 'components/DynamicArrow';
import NetworkSelectModal from '../NetworkSelectModal';

export interface NetworkSelectedProps {
  className?: string;
  selected: TNetworkItem;
  networkList: TNetworkItem[];
  onChange?: (item: TNetworkItem) => void;
  selectCallback?: (item: TNetworkItem) => Promise<void>;
}

export default function NetworkSelected({
  className,
  selected,
  networkList,
  onChange,
  selectCallback,
}: NetworkSelectedProps) {
  const { isPadPX } = useCommonState();
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
    setIsShowNetworkSelectModal(true);
  }, []);

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
        <span className={clsx('flex-row-center gap-8', styles['select-network-value-selected'])}>
          {renderNetworkLogo}
          <span className={styles['select-network-value-selected-name']}>{selected?.name}</span>
        </span>
      )
    );
  }, [renderNetworkLogo, selected?.name, selected?.network]);

  return (
    <>
      <div
        className={clsx(
          'flex-row-center-between gap-8 cursor-pointer',
          styles['network-selected'],
          className,
        )}
        onClick={openModal}>
        {renderSelected}
        <DynamicArrow size={isPadPX ? 'Small' : 'Normal'} isExpand={isShowNetworkSelectModal} />
      </div>

      <NetworkSelectModal
        open={isShowNetworkSelectModal}
        networkList={networkList}
        onSelect={onSelectNetwork}
        onClose={() => setIsShowNetworkSelectModal(false)}
      />
    </>
  );
}
