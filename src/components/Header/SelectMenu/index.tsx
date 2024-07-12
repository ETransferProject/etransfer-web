import React, { useState } from 'react';
import clsx from 'clsx';
import { Collapse } from 'antd';
import MenuOutlined from '@ant-design/icons/MenuOutlined';
import CommonDrawer from 'components/CommonDrawer';
import { MENU_ITEMS, SideMenuKey } from 'constants/home';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import myEvents from 'utils/myEvent';
import { useChangeSideMenu } from 'hooks/route';
import { FOOTER_CONFIG } from 'constants/footer';
import LinkForBlank from 'components/LinkForBlank';
import { ArrowUp, Fingerprint } from 'assets/images';

export default function SelectMenu() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const { activeMenuKey, isUnreadHistory, isMobilePX } = useCommonState();
  const changeSideMenu = useChangeSideMenu();
  const [activePanel, setActivePanel] = useState<string | string[]>([]);

  return (
    <>
      <div
        className={clsx('flex-none', 'flex-row-center', styles['header-icon-wrapper'])}
        onClick={() => {
          setIsDrawerOpen(true);
        }}>
        <MenuOutlined className={styles['header-icon']} rev={undefined} />
      </div>
      <CommonDrawer
        zIndex={301}
        className={clsx(styles['menu-drawer'], styles['menu-drawer-weight'])}
        height="100%"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}>
        <div className={clsx('flex-column', styles['menu-drawer-body'])}>
          <div>
            {MENU_ITEMS.map((item) => {
              const MenuIcon = item.icon;
              return (
                <div
                  key={item.key}
                  className={clsx('flex-row-center', styles['menu-item'], {
                    [styles['menu-item-active']]: item.key === activeMenuKey,
                  })}
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (item.key === SideMenuKey.History && isUnreadHistory) {
                      myEvents.HistoryActive.emit();
                    }
                    changeSideMenu(item.key);
                  }}>
                  <MenuIcon className={styles['menu-item-icon']} />
                  <div className={styles['menu-item-label']}>
                    {item.label}
                    {isUnreadHistory && item.key === SideMenuKey.History && (
                      <span className={styles['menu-item-red-dot']} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isMobilePX && (
            <>
              <div className={styles['divider']} />
              <div className={styles['footer']}>
                <LinkForBlank
                  href={FOOTER_CONFIG.faq.link}
                  className={styles['menu-secondMenu-item']}
                  ariaLabel="FAQ"
                  element={
                    <div className={clsx('flex-row-center', styles['footer-item-faq'])}>
                      <FOOTER_CONFIG.faq.icon />
                      <span className={styles['footer-item-faq-name']}>
                        {FOOTER_CONFIG.faq.name}
                      </span>
                    </div>
                  }
                />

                <Collapse
                  ghost
                  expandIconPosition="end"
                  onChange={(res) => {
                    setActivePanel(res);
                  }}>
                  {FOOTER_CONFIG.menus.map((menu) => {
                    return (
                      <Collapse.Panel
                        key={'footerMenus' + menu.group}
                        className={styles['footer-item']}
                        forceRender={true}
                        showArrow={false}
                        header={
                          <div className="flex-row-center-between">
                            <div>
                              <span
                                className={clsx('flex-row-center', styles['footer-item-group'])}>
                                <menu.icon />
                                <span className={styles['footer-item-group-name']}>
                                  {menu.group}
                                </span>
                              </span>
                            </div>
                            <ArrowUp
                              className={
                                activePanel?.includes('footerMenus' + menu.group)
                                  ? ''
                                  : styles['arrow-down']
                              }
                            />
                          </div>
                        }>
                        {menu.items.map((secondMenu) => {
                          return (
                            <LinkForBlank
                              key={'footerSecondMenu' + secondMenu.name}
                              href={secondMenu.link}
                              className={styles['footer-secondMenu-wrapper']}
                              ariaLabel={secondMenu.name}
                              element={
                                <div
                                  className={clsx(
                                    'flex-row-center-between',
                                    styles['footer-secondMenu-item'],
                                  )}>
                                  <div className="flex-row-center">
                                    {secondMenu.iconBig && (
                                      <span
                                        className={clsx(
                                          'flex-row-center',
                                          styles['secondMenu-item-icon'],
                                        )}>
                                        <secondMenu.iconBig />
                                      </span>
                                    )}
                                    <span className={styles['secondMenu-item-name']}>
                                      {secondMenu.name}
                                    </span>
                                  </div>
                                  <Fingerprint />
                                </div>
                              }
                            />
                          );
                        })}
                      </Collapse.Panel>
                    );
                  })}
                </Collapse>
              </div>
            </>
          )}
        </div>
      </CommonDrawer>
    </>
  );
}
