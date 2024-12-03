import { useMemo, useState, useEffect } from 'react';
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
  modalTitle: string;
  open: boolean;
  networkList: TNetworkItem[];
  onSelect: (item: TNetworkItem) => Promise<void>;
  onClose: () => void;
}

const SearchByChainName = 'Search by chain name';

export default function NetworkSelectModal({
  className,
  modalTitle,
  open = false,
  networkList,
  onSelect,
  onClose,
}: NetworkSelectModalProps) {
  const { isPadPX } = useCommonState();
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!open) {
      setSearchKeyword('');
    }
  }, [open]);

  const filteredNetworkList = useMemo(() => {
    if (!searchKeyword) return networkList;

    const keyword = searchKeyword.toLowerCase();
    return networkList.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [networkList, searchKeyword]);

  const content = useMemo(() => {
    return (
      <>
        <div className={styles['network-search']}>
          <Input
            className={styles['network-search-input']}
            placeholder={SearchByChainName}
            prefix={<SearchIcon />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
        <div className={styles['network-list']}>
          {filteredNetworkList.map((item, index) => {
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
  }, [filteredNetworkList, onSelect, searchKeyword]);

  if (isPadPX) {
    return (
      <CommonDrawer
        className={clsx(
          styles['network-select-drawer'],
          styles['network-select-drawer-weight'],
          className,
        )}
        height="80%"
        title={modalTitle}
        open={open}
        onClose={onClose}>
        {content}
      </CommonDrawer>
    );
  }

  return (
    <CommonModal
      className={clsx(styles['network-select-modal'], className)}
      title={modalTitle}
      open={open}
      onCancel={onClose}
      hideCancelButton
      hideOkButton>
      {content}
    </CommonModal>
  );
}
