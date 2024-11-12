import { CommonModal } from '@etransfer/ui-react';
import { CONNECT_WALLET } from 'constants/wallet/index';
import styles from './styles.module.scss';
import AelfWalletList from './aelfList';
import EVMWalletList from './EVMList';
import SolanaWalletList from './SolanaList';
import TONWalletList from './TONList';
import TRONWalletList from './TRONList';
import { WalletTypeEnum } from 'context/Wallet/types';

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
  onCancel,
}: {
  open: boolean;
  title?: string;
  allowList?: WalletTypeEnum[];
  onCancel: () => void;
}) {
  return (
    <CommonModal
      open={open}
      getContainer="#ConnectWalletButton"
      wrapClassName={styles['connect-wallet-modal-wrap']}
      className={styles['connect-wallet-modal']}
      title={title}
      hideCancelButton
      hideOkButton
      onCancel={onCancel}>
      <div>
        {allowList?.includes(WalletTypeEnum.AELF) && <AelfWalletList />}
        {allowList?.includes(WalletTypeEnum.EVM) && <EVMWalletList />}
        {allowList?.includes(WalletTypeEnum.SOL) && <SolanaWalletList />}
        {allowList?.includes(WalletTypeEnum.TRON) && <TRONWalletList />}
        {allowList?.includes(WalletTypeEnum.TON) && <TONWalletList />}
      </div>
    </CommonModal>
  );
}
