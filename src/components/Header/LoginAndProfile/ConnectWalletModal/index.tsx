import { CommonModal } from '@etransfer/ui-react';
import { CONNECT_AELF_WALLET } from 'constants/wallet';
import styles from './styles.module.scss';
import AelfWalletList from './aelfList';
import EVMWalletList from './EVMList';
import SolanaWalletList from './SolanaList';
import TONWalletList from './TONList';
import TRONWalletList from './TRONList';

export default function ConnectWalletModal({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) {
  return (
    <CommonModal
      open={open}
      getContainer="#ConnectWalletButton"
      wrapClassName={styles['connect-wallet-modal-wrap']}
      className={styles['connect-wallet-modal']}
      title={CONNECT_AELF_WALLET}
      hideCancelButton
      hideOkButton
      onCancel={onCancel}>
      <div>
        <AelfWalletList />
        <EVMWalletList />
        <SolanaWalletList />
        <TRONWalletList />
        <TONWalletList />
      </div>
    </CommonModal>
  );
}
