import clsx from 'clsx';
import styles from './styles.module.scss';
import { NetworkItem } from 'types/api';
import { SideMenuKey } from 'constants/home';
import Info from 'assets/images/info.svg';
import { NetworkCardForMobile, NetworkCardForWeb } from 'pageComponents/NetworkCard';
import { useCommonState } from 'store/Provider/hooks';

export interface NetworkSelectProps {
  className?: string;
  type: SideMenuKey;
  networkList: NetworkItem[];
  selectedNetwork?: string;
  onSelect: (item: NetworkItem) => Promise<void>;
}

const DEPOSIT_TIP_CONTENT =
  'Note: Please select from the supported networks listed below. Sending USDT from other networks may result in the loss of your assets.';

const WITHDRAW_TIP_CONTENT =
  'Please ensure that your receiving platform supports the token and network. If you are unsure, kindly check with the platform before proceeding.';

function NetworkSelectTip({ menuType = SideMenuKey.Deposit }: { menuType?: SideMenuKey }) {
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
      {menuType === SideMenuKey.Withdraw && (
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
  onSelect,
}: NetworkSelectProps) {
  const { activeMenuKey } = useCommonState();
  return (
    <div className={clsx(styles['network-select'], styles['network-select-for-mobile'], className)}>
      <NetworkSelectTip menuType={activeMenuKey} />
      <div className={styles['network-select-list']}>
        {networkList.map((item, idx) => {
          return (
            <NetworkCardForMobile
              key={'network-select' + item.network + idx}
              className={
                selectedNetwork == item.network ? styles['network-card-selected'] : undefined
              }
              name={item.name}
              type={type}
              transactionFee={item.withdrawFee}
              transactionFeeUnit={item.withdrawFeeUnit}
              multiConfirmTime={item.multiConfirmTime}
              multiConfirm={item.multiConfirm}
              onClick={() => onSelect(item)}
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
  onSelect,
}: NetworkSelectProps) {
  const { activeMenuKey } = useCommonState();
  return (
    <div className={clsx(styles['network-select'], styles['network-select-for-web'], className)}>
      <NetworkSelectTip menuType={activeMenuKey} />
      <div className={styles['network-select-list']}>
        {networkList.map((item, idx) => {
          return (
            <NetworkCardForWeb
              key={'network-select' + item.network + idx}
              className={
                selectedNetwork == item.network ? styles['network-card-selected'] : undefined
              }
              network={item.network}
              name={item.name}
              type={type}
              transactionFee={item.withdrawFee}
              transactionFeeUnit={item.withdrawFeeUnit}
              multiConfirmTime={item.multiConfirmTime}
              multiConfirm={item.multiConfirm}
              onClick={() => onSelect(item)}
            />
          );
        })}
      </div>
    </div>
  );
}
