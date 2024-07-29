import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import LogoutButton from 'components/Header/LoginAndProfile/LogoutButton';
import { User } from 'assets/images';
import Address from '../Address';
import styles from './styles.module.scss';
import { TelegramPlatform } from 'utils/telegram';
import { Popover } from 'antd';

export default function WebUserProfile() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isShowLogout, setIsShowLogout] = useState(true);

  useEffect(() => {
    const res = TelegramPlatform.isTelegramPlatform();
    setIsShowLogout(!res);
  }, []);

  const handleHide = useCallback(() => {
    setIsOpen(false);
  }, []);
  const handleClickChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <Popover
      overlayClassName={styles['web-user-profile']}
      placement="bottomRight"
      content={
        <>
          <Address hideBorder={false} />
          {isShowLogout && (
            <div className={styles['button-wrapper']}>
              <LogoutButton closeDialog={handleHide} />
            </div>
          )}
        </>
      }
      trigger="click"
      open={isOpen}
      onOpenChange={handleClickChange}>
      <div className={clsx('flex-row-center', styles['main-content'])}>
        <User className={clsx('flex-none', styles['wallet-icon'])} />
        <span className={styles['wallet-text']}>My</span>
      </div>
    </Popover>
  );
}
