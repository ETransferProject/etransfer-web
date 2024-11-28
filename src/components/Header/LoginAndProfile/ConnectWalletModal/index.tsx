import { useMemo } from 'react';
import clsx from 'clsx';
import { CommonModal } from '@etransfer/ui-react';
import CommonDrawer from 'components/CommonDrawer';
import { CONNECT_WALLET } from 'constants/wallet/index';
import styles from './styles.module.scss';
import AelfWalletList from './aelfList';
import EVMWalletList from './EVMList';
import SolanaWalletList from './SolanaList';
import TONWalletList from './TONList';
import TRONWalletList from './TRONList';
import { WalletTypeEnum } from 'context/Wallet/types';
import { useCommonState } from 'store/Provider/hooks';

export default function ConnectWalletModal({
  open,
  title = CONNECT_WALLET,
  allowList = [
    WalletTypeEnum.AELF,
    WalletTypeEnum.EVM,
    WalletTypeEnum.SOL,
    WalletTypeEnum.TRON,
    WalletTypeEnum.TON,
  ],
  drawerZIndex = 80,
  onCancel,
  onSelected,
}: {
  open: boolean;
  title?: string;
  allowList?: WalletTypeEnum[];
  drawerZIndex?: number;
  onCancel: () => void;
  onSelected?: (walletType: WalletTypeEnum) => void;
}) {
  const { isPadPX } = useCommonState();

  const content = useMemo(() => {
    return (
      <div>
        {allowList?.includes(WalletTypeEnum.AELF) && <AelfWalletList onSelected={onSelected} />}
        {allowList?.includes(WalletTypeEnum.EVM) && <EVMWalletList onSelected={onSelected} />}
        {allowList?.includes(WalletTypeEnum.SOL) && <SolanaWalletList onSelected={onSelected} />}
        {allowList?.includes(WalletTypeEnum.TRON) && <TRONWalletList onSelected={onSelected} />}
        {allowList?.includes(WalletTypeEnum.TON) && <TONWalletList onSelected={onSelected} />}
      </div>
    );
  }, [allowList, onSelected]);

  if (isPadPX) {
    return (
      <CommonDrawer
        zIndex={drawerZIndex}
        className={clsx(styles['connect-wallet-drawer'], styles['connect-wallet-drawer-weight'])}
        height="100%"
        title={title}
        open={open}
        onClose={onCancel}>
        {content}
      </CommonDrawer>
    );
  }

  return (
    <CommonModal
      open={open}
      width={400}
      getContainer="#ConnectWalletButton"
      wrapClassName={styles['connect-wallet-modal-wrap']}
      className={styles['connect-wallet-modal']}
      title={title}
      hideCancelButton
      hideOkButton
      destroyOnClose
      onCancel={onCancel}>
      {content}
    </CommonModal>
  );
}
