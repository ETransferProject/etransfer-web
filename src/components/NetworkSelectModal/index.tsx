import { useMemo, useState, useEffect } from 'react';
import clsx from 'clsx';
import { Input } from 'antd';
import CommonModal from 'components/CommonModal';
import CommonDrawer from 'components/CommonDrawer';
import Remind, { RemindType } from 'components/Remind';
import NetworkLogo from 'components/NetworkLogo';
import { NetworkStatus, TNetworkItem } from 'types/api';
import { useCommonState } from 'store/Provider/hooks';
import { SearchIcon } from 'assets/images';
import styles from './styles.module.scss';
import { SELECT_CHAIN } from 'constants/misc';

export type TNetwork = Pick<TNetworkItem, 'network' | 'name'> &
  Omit<Partial<TNetworkItem>, 'network' | 'name'>;

export interface NetworkSelectModalProps<T extends TNetwork | TNetworkItem> {
  className?: string;
  modalTitle?: string;
  open: boolean;
  networkList: T[];
  remindContent?: string;
  onSelect: (item: T) => Promise<void>;
  onClose: () => void;
}

const SearchByChainName = 'Search by chain name';

export default function NetworkSelectModal<T extends TNetwork | TNetworkItem>({
  className,
  modalTitle = SELECT_CHAIN,
  open = false,
  networkList,
  remindContent,
  onSelect,
  onClose,
}: NetworkSelectModalProps<T>) {
  const { isPadPX, isMobilePX } = useCommonState();
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
        {remindContent && (
          <Remind className={styles['network-tip']} type={RemindType.INFO} isCard isBorder={false}>
            {remindContent}
          </Remind>
        )}
        <div className={styles['network-list']}>
          {filteredNetworkList?.map((item, index) => {
            return (
              <div
                key={'NetworkSelectModal-item-' + index}
                className={clsx(
                  styles['network-item'],
                  item.status === NetworkStatus.Offline && styles['network-item-disabled'],
                )}
                onClick={() => onSelect(item)}>
                <div className="flex-row-center gap-8">
                  <NetworkLogo network={item.network} size={isMobilePX ? 'normal' : 'big'} />
                  <span className={styles['network-item-key']}>{item.name}</span>
                  {item.status === NetworkStatus.Offline && (
                    <span className={styles['network-item-suspended']}>Suspended</span>
                  )}
                </div>

                {!!item.multiConfirmTime && (
                  <div className={styles['network-multi-confirm-wrap']}>
                    <span className={styles['network-multi-confirm-time']}>{`${
                      isMobilePX ? 'Arrival Time ' : ''
                    }≈ ${item.multiConfirmTime}`}</span>
                    <span className={styles['network-multi-confirm']}>{item.multiConfirm}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  }, [filteredNetworkList, isMobilePX, onSelect, searchKeyword, remindContent]);

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
      wrapClassName={styles['network-select-modal-wrap']}
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
