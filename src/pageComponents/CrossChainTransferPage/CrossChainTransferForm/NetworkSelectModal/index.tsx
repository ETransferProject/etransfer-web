import CommonModal from 'components/CommonModal';
import NetworkLogo from 'components/NetworkLogo';
import { NetworkStatus, TNetworkItem } from 'types/api';
import styles from './styles.module.scss';
import { Input } from 'antd';
import clsx from 'clsx';

export interface NetworkSelectModalProps {
  className?: string;
  open: boolean;
  networkList: TNetworkItem[];
  onSelect: (item: TNetworkItem) => Promise<void>;
  onClose: () => void;
}

const SelectSourceChain = 'Select Source Chain';
const SearchByChainName = 'Search by chain name';

export default function NetworkSelectModal({
  className,
  open = false,
  networkList,
  onSelect,
  onClose,
}: NetworkSelectModalProps) {
  return (
    <CommonModal
      className={clsx(styles['network-select-modal'], className)}
      title={SelectSourceChain}
      open={open}
      onCancel={onClose}
      hideCancelButton
      hideOkButton>
      <div className={styles['network-search']}>
        <Input className={styles['network-search-input']} placeholder={SearchByChainName} />
      </div>
      <div className={styles['network-list']}>
        {networkList.map((item, index) => {
          return (
            <div
              key={'NetworkSelectModal-item-' + index}
              className={clsx(
                'flex-row-center-between gap-8',
                styles['network-item'],
                item.status === NetworkStatus.Offline && styles['network-item-disabled'],
              )}
              onClick={() => onSelect(item)}>
              <div className="flex-row-center gap-8">
                <NetworkLogo network={item.network} />
                <span className={styles['network-item-key']}>{item.name}</span>
                {item.status === NetworkStatus.Offline && (
                  <span className={styles['network-item-suspended']}>Suspended</span>
                )}
              </div>

              <div className="flex-column-end">
                <span
                  className={
                    styles['network-multi-confirm-time']
                  }>{`≈ ${item.multiConfirmTime}`}</span>
                <span className={styles['network-multi-confirm']}>{item.multiConfirm}</span>
              </div>
            </div>
          );
        })}
      </div>
    </CommonModal>
  );
}
