import clsx from 'clsx';
import { Modal, ModalProps } from 'antd';
import CloseIcon from 'assets/images/close.svg';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import styles from './styles.module.scss';

export type CommonModalProps = Omit<
  ModalProps,
  'footer' | 'confirmLoading' | 'okButtonProps' | 'okType'
> & {
  footerClassName?: string;
  cancelText?: string;
  okText?: string;
  hideCancelButton?: boolean;
  hideOkButton?: boolean;
  isOkButtonDisabled?: boolean;
  footerSlot?: React.ReactNode;
};

export default function CommonModal({
  className,
  footerClassName,
  cancelText,
  okText,
  hideCancelButton,
  hideOkButton,
  isOkButtonDisabled,
  ...props
}: CommonModalProps) {
  return (
    <Modal
      width={props.width || 480}
      centered
      zIndex={299}
      closeIcon={<CloseIcon />}
      {...props}
      className={clsx(styles['common-modal'], className)}
      // To keep the title height by default
      title={props.title || ' '}
      footer={null}>
      {props.children}
      {(!hideCancelButton || !hideOkButton) && (
        <div className={clsx('flex-row-center', styles['footer'], footerClassName)}>
          {!hideCancelButton && (
            <CommonButton
              className={clsx('flex-1', styles['cancel-button'])}
              type={CommonButtonType.Secondary}
              onClick={props.onCancel}>
              {cancelText || 'Cancel'}
            </CommonButton>
          )}
          {!hideOkButton && (
            <CommonButton
              className={clsx('flex-1', styles['ok-button'])}
              disabled={isOkButtonDisabled}
              onClick={props.onOk}>
              {okText || 'Confirm'}
            </CommonButton>
          )}
        </div>
      )}
      {props.footerSlot}
    </Modal>
  );
}
