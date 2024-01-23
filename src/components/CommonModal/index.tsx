import clsx from 'clsx';
import { Modal, ModalProps } from 'antd';
import CloseIcon from 'assets/images/close.svg';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import styles from './styles.module.scss';

type CommonModalProps = Omit<
  ModalProps,
  'footer' | 'closeIcon' | 'confirmLoading' | 'okButtonProps' | 'okType'
> & {
  footerClassName?: string;
  cancelText?: string;
  okText?: string;
  hideCancelButton?: boolean;
  hideOkButton?: boolean;
  isOkButtonDisabled?: boolean;
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
      width={480}
      centered
      {...props}
      className={clsx(styles['common-modal'], className)}
      // To keep the title height by default
      title={props.title || ' '}
      closeIcon={<CloseIcon />}
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
    </Modal>
  );
}
