import { Drawer, DrawerProps } from 'antd';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Close from 'assets/images/close.svg';

export default function CommonDrawer({ className, width, ...props }: DrawerProps) {
  return (
    <Drawer
      closable={true}
      closeIcon={<Close />}
      destroyOnClose
      placement="bottom"
      height="88%"
      {...props}
      width={width ?? '100%'}
      className={clsx(styles['common-drawer'], className)}
    />
  );
}
