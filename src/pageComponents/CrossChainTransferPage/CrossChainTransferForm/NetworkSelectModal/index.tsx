import { useMemo } from 'react';
import CommonModal from 'components/CommonModal';
import NetworkLogo from 'components/NetworkLogo';
import { NetworkStatus, TNetworkItem } from 'types/api';
import styles from './styles.module.scss';
import { Input } from 'antd';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import CommonDrawer from 'components/CommonDrawer';
import { SearchIcon } from 'assets/images';

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
  const { isPadPX } = useCommonState();

  const content = useMemo(() => {
    return (
      <>
        <div className={styles['network-search']}>
          <Input
            className={styles['network-search-input']}
            placeholder={SearchByChainName}
            prefix={<SearchIcon />}
          />
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
      </>
    );
  }, [networkList, onSelect]);

  if (isPadPX) {
    return (
      <CommonDrawer
        className={clsx(
          styles['network-select-drawer'],
          styles['network-select-drawer-weight'],
          className,
        )}
        height="80%"
        title={SelectSourceChain}
        open={open}
        onClose={onClose}>
        {content}
      </CommonDrawer>
    );
  }

  return (
    <CommonModal
      className={clsx(styles['network-select-modal'], className)}
      title={SelectSourceChain}
      open={open}
      onCancel={onClose}
      hideCancelButton
      hideOkButton>
      {content}
    </CommonModal>
  );
}
