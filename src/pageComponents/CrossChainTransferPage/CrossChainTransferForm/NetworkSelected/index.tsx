import clsx from 'clsx';
import styles from './styles.module.scss';
import NetworkLogo from 'components/NetworkLogo';
import { useCallback, useMemo, useState } from 'react';
import { TNetworkItem } from 'types/api';
import { useCommonState, useCrossChainTransfer } from 'store/Provider/hooks';
import DynamicArrow from 'components/DynamicArrow';
import NetworkSelectModal from '../NetworkSelectModal';

export interface NetworkSelectedProps {
  className?: string;
  onChange?: (item: TNetworkItem) => void;
  selectCallback?: (item: TNetworkItem) => Promise<void>;
}

export default function NetworkSelected({
  className,
  onChange,
  selectCallback,
}: NetworkSelectedProps) {
  const { isPadPX } = useCommonState();
  const { fromNetwork, fromNetworkList } = useCrossChainTransfer();
  const [isShowNetworkSelectModal, setIsShowNetworkSelectModal] = useState<boolean>(false);

  const onSelectNetwork = useCallback(
    async (item: TNetworkItem) => {
      if (item.network === fromNetwork?.network) {
        setIsShowNetworkSelectModal(false);
        return;
      }
      onChange?.(item);

      setIsShowNetworkSelectModal(false);

      await selectCallback?.(item);
    },
    [fromNetwork?.network, onChange, selectCallback],
  );

  const openModal = useCallback(() => {
    setIsShowNetworkSelectModal(true);
  }, []);

  const renderNetworkLogo = useMemo(() => {
    return (
      fromNetwork?.network && (
        <NetworkLogo
          className="flex-shrink-0 flex"
          network={fromNetwork?.network}
          size={isPadPX ? 'small' : 'big'}
        />
      )
    );
  }, [fromNetwork?.network, isPadPX]);

  const renderSelected = useMemo(() => {
    return (
      fromNetwork?.network && (
        <span className={clsx('flex-row-center gap-8', styles['select-network-value-selected'])}>
          {renderNetworkLogo}
          <span className={styles['select-network-value-selected-name']}>{fromNetwork?.name}</span>
        </span>
      )
    );
  }, [fromNetwork?.name, fromNetwork?.network, renderNetworkLogo]);

  return (
    <>
      <div
        className={clsx('flex-row-center-between gap-8 cursor-pointer', className)}
        onClick={openModal}>
        {renderSelected}
        <DynamicArrow size={isPadPX ? 'Small' : 'Normal'} isExpand={isShowNetworkSelectModal} />
      </div>

      <NetworkSelectModal
        open={isShowNetworkSelectModal}
        networkList={fromNetworkList || []}
        onSelect={onSelectNetwork}
        onClose={() => setIsShowNetworkSelectModal(false)}
      />
    </>
  );
}
