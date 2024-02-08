import CommonModal, { CommonModalProps } from 'components/CommonModal';
import styles from './styles.module.scss';
import clsx from 'clsx';

export default function CommonModalTips({
  open = false,
  getContainer = 'body',
  ...props
}: CommonModalProps) {
  return (
    <CommonModal
      {...props}
      getContainer={getContainer}
      className={clsx(styles.commonModalTips, props?.className)}
      footerClassName={clsx(styles.commonModalTipsFooter, props?.footerClassName)}
      open={open}
      hideCancelButton={true}>
      {props.children}
    </CommonModal>
  );
}
