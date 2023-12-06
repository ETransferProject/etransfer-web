import clsx from 'clsx';
import CommonDrawer from 'components/CommonDrawer';
import CommonModal from 'components/CommonModal';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';

export interface CommonModalSwitchDrawerProps {
  title?: string;
  children?: React.ReactNode;
  drawerClassName?: string;
  modalClassName?: string;
  hideCancelButton?: boolean;
  hideOkButton?: boolean;
  cancelText?: string;
  okText?: string;
  open?: boolean;
  onClose?: () => void;
  onOk?: () => void;
}

export default function CommonModalSwitchDrawer({
  drawerClassName,
  modalClassName,
  onClose,
  ...props
}: CommonModalSwitchDrawerProps) {
  const { isMobilePX } = useCommonState();
  return isMobilePX ? (
    <CommonDrawer
      {...props}
      className={clsx(styles['drawer-wrapper'], drawerClassName)}
      footer={
        !props.hideCancelButton || !props.hideOkButton ? (
          <>
            {!props.hideCancelButton && (
              <CommonButton
                className={styles['cancel-button']}
                type={CommonButtonType.Secondary}
                onClick={onClose}>
                {props.cancelText || 'Cancel'}
              </CommonButton>
            )}
            {!props.hideOkButton && (
              <CommonButton className={styles['ok-button']} onClick={props.onOk}>
                {props.okText || 'Confirm'}
              </CommonButton>
            )}
          </>
        ) : null
      }
      onClose={onClose}
    />
  ) : (
    <CommonModal {...props} className={modalClassName} onCancel={onClose} />
  );
}
