import CommonModal, { CommonModalProps } from 'components/CommonModal';
import styles from './styles.module.scss';

type TUnsavedChangesWarningModalProps = Pick<CommonModalProps, 'open' | 'onCancel' | 'onOk'>;

export default function UnsavedChangesWarningModal(props: TUnsavedChangesWarningModalProps) {
  return (
    <CommonModal
      {...props}
      className={styles['unsaved-changes-warning-modal']}
      footerClassName={styles['unsaved-changes-warning-modal-footer']}
      title="Unsaved Changes Warning">
      <p>Are you sure you want to go back? Any information you’ve entered will be lost.</p>
    </CommonModal>
  );
}
