import { Drawer, DrawerProps } from 'antd';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Close from 'assets/images/close.svg';

export default function CommonDrawer({ className, width, height, ...props }: DrawerProps) {
  return (
    <Drawer
      closable={true}
      closeIcon={<Close />}
      destroyOnClose
      placement="bottom"
      width={width || '100%'}
      height={height || '88%'}
      {...props}
      className={clsx(styles['common-drawer'], className)}
    />
  );
}
