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
  isOkButtonDisabled?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOk?: () => void;
  linkToExplore?: React.ReactNode;
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
      className={styles['drawer-wrapper']}
      footer={
        <>
          {!props.hideCancelButton || !props.hideOkButton ? (
            <div className={clsx(styles['drawer-button-wrapper'], drawerClassName)}>
              {!props.hideCancelButton && (
                <CommonButton
                  className={styles['cancel-button']}
                  type={CommonButtonType.Secondary}
                  onClick={onClose}>
                  {props.cancelText || 'Cancel'}
                </CommonButton>
              )}
              {!props.hideOkButton && (
                <CommonButton
                  className={styles['ok-button']}
                  disabled={props.isOkButtonDisabled}
                  onClick={props.onOk}>
                  {props.okText || 'Confirm'}
                </CommonButton>
              )}
            </div>
          ) : null}
          {props.linkToExplore}
        </>
      }
      onClose={onClose}
    />
  ) : (
    <CommonModal {...props} className={modalClassName} onCancel={onClose} />
  );
}
