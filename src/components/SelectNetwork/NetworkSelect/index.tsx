import clsx from 'clsx';
import styles from './styles.module.scss';
import { TNetworkItem } from 'types/api';
import { SideMenuKey } from 'constants/home';
import Info from 'assets/images/info.svg';
import { NetworkCardForMobile, NetworkCardForWeb } from 'components/SelectNetwork/NetworkCard';
import { useCommonState } from 'store/Provider/hooks';
import {
  NetworkListSkeletonForMobile,
  NetworkListSkeletonForWeb,
} from 'components/Skeleton/NetworkListSkeleton';

export interface TNetworkSelectProps {
  className?: string;
  type: SideMenuKey;
  networkList: TNetworkItem[];
  selectedNetwork?: string;
  isDisabled?: boolean;
  isShowLoading?: boolean;
  onSelect: (item: TNetworkItem) => Promise<void>;
}

const DEPOSIT_TIP_CONTENT =
  'Note: Please select from the supported networks listed below. Sending tokens from other networks may result in the loss of your assets.';

const WITHDRAW_TIP_CONTENT =
  'Please ensure that your receiving platform supports the digital asset and network. If you are unsure, kindly check with the platform before proceeding.';

function NetworkSelectTip({
  menuType = SideMenuKey.Deposit,
  showHighlight = true,
}: {
  menuType?: SideMenuKey;
  showHighlight?: boolean;
}) {
  return (
    <div
      className={clsx('flex-column', styles['network-select-tip-wrapper'], {
        [styles['network-select-tip-wrapper-deposit']]: menuType === SideMenuKey.Deposit,
      })}>
      <div className={styles['network-select-tip']}>
        <Info className={styles['network-select-tip-icon']} />
        <span className={styles['network-select-tip-text']}>
          {menuType === SideMenuKey.Deposit ? DEPOSIT_TIP_CONTENT : WITHDRAW_TIP_CONTENT}
        </span>
      </div>
      {menuType === SideMenuKey.Withdraw && showHighlight && (
        <div className={styles['network-select-tip-highlight']}>
          Networks not matching your withdrawal address have been automatically excluded. Please
          select from the networks listed below.
        </div>
      )}
    </div>
  );
}

export function NetworkSelectForMobile({
  className,
  type,
  networkList,
  selectedNetwork,
  isDisabled,
  isShowLoading = false,
  onSelect,
}: TNetworkSelectProps) {
  const { activeMenuKey } = useCommonState();
  return (
    <div className={clsx(styles['network-select'], styles['network-select-for-mobile'], className)}>
      <NetworkSelectTip
        menuType={activeMenuKey}
        showHighlight={
          !isShowLoading && !isDisabled && Array.isArray(networkList) && networkList.length > 0
        }
      />
      <div className={styles['network-select-list']}>
        {(isShowLoading || !Array.isArray(networkList) || networkList.length == 0) && (
          <NetworkListSkeletonForMobile />
        )}
        {!isShowLoading &&
          networkList.map((item, idx) => {
            return (
              <NetworkCardForMobile
                key={'network-select' + item.network + idx}
                className={
                  selectedNetwork == item.network ? styles['network-card-selected'] : undefined
                }
                isDisabled={isDisabled}
                network={item.network} // item.network === BlockchainNetworkType.AELF ? item.chainId :
                name={item.name}
                type={type}
                transactionFee={item.withdrawFee}
                transactionFeeUnit={item.withdrawFeeUnit}
                multiConfirmTime={item.multiConfirmTime}
                multiConfirm={item.multiConfirm}
                onClick={() => onSelect(item)}
                status={item.status}
              />
            );
          })}
      </div>
    </div>
  );
}

export function NetworkSelectForWeb({
  className,
  type,
  networkList,
  selectedNetwork,
  isDisabled,
  isShowLoading = false,
  onSelect,
}: TNetworkSelectProps) {
  const { activeMenuKey } = useCommonState();
  return (
    <div className={clsx(styles['network-select'], styles['network-select-for-web'], className)}>
      <NetworkSelectTip
        menuType={activeMenuKey}
        showHighlight={
          !isShowLoading && !isDisabled && Array.isArray(networkList) && networkList.length > 0
        }
      />
      <div className={styles['network-select-list']}>
        {(isShowLoading || !Array.isArray(networkList) || networkList.length == 0) && (
          <NetworkListSkeletonForWeb />
        )}
        {!isShowLoading &&
          networkList.map((item, idx) => {
            return (
              <NetworkCardForWeb
                key={'network-select' + item.network + idx}
                className={
                  selectedNetwork == item.network ? styles['network-card-selected'] : undefined
                }
                isDisabled={isDisabled}
                network={item.network}
                name={item.name}
                type={type}
                transactionFee={item.withdrawFee}
                transactionFeeUnit={item.withdrawFeeUnit}
                multiConfirmTime={item.multiConfirmTime}
                multiConfirm={item.multiConfirm}
                onClick={() => onSelect(item)}
                status={item.status}
              />
            );
          })}
      </div>
    </div>
  );
}
