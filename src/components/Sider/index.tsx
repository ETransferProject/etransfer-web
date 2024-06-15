import React, { useEffect } from 'react';
import { Space } from 'antd';
import clsx from 'clsx';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import { store } from 'store/Provider/store';
import { useCommonState } from 'store/Provider/hooks';
import { SideMenuKey, MENU_ITEMS } from 'constants/home';
import styles from './styles.module.scss';
import myEvents from 'utils/myEvent';

export default function Sider() {
  const { activeMenuKey, isUnreadHistory } = useCommonState();
  useEffect(() => {
    // init activeMenuKey
    if (!activeMenuKey) {
      store.dispatch(setActiveMenuKey(SideMenuKey.Deposit));
    }
  }, [activeMenuKey]);
  return (
    <div className={clsx('flex-column-between', styles['menu-container'])}>
      <Space className={styles['menu-items-wrapper']} direction="vertical">
        {MENU_ITEMS.map((item) => {
          const MenuIcon = item.icon;
          return (
            <div
              key={item.key}
              className={clsx('cursor-pointer', 'flex-row-center', styles['menu-item'], {
                [styles['menu-item-active']]: item.key === activeMenuKey,
              })}
              onClick={() => {
                store.dispatch(setActiveMenuKey(item.key));
                if (item.key === SideMenuKey.History && isUnreadHistory) {
                  myEvents.HistoryActive.emit();
                }
              }}>
              <MenuIcon className={clsx('flex-none', styles['menu-item-icon'])} />
              <span className={styles['menu-item-label']}>{item.label}</span>
              {isUnreadHistory && item.key === SideMenuKey.History && (
                <span className={styles['menu-item-red-dot']} />
              )}
            </div>
          );
        })}
      </Space>
    </div>
  );
}
