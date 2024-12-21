import { useMemo } from 'react';
import { FOOTER_CONFIG } from 'constants/footer';
import styles from './styles.module.scss';
import LinkForBlank from 'components/LinkForBlank';
import clsx from 'clsx';
import { TFooterMenu } from 'types/footer';

export default function Footer() {
  const { communityMenu, otherMenus } = useMemo(() => {
    let _communityMenu: TFooterMenu | undefined;
    const _otherMenus: TFooterMenu[] = [];
    FOOTER_CONFIG.menus.forEach((menu) => {
      if (menu.group === 'Community') {
        _communityMenu = menu;
      } else {
        _otherMenus.push(menu);
      }
    });
    return { communityMenu: _communityMenu, otherMenus: _otherMenus };
  }, []);

  return (
    <div className={clsx('flex', styles['footer'])}>
      {/* left */}
      <div className={styles['left']}>
        <div className={styles['left-logo']}>
          <FOOTER_CONFIG.logoUrl />
        </div>
        <div className={styles['left-describe']}>
          {FOOTER_CONFIG.describe.map((item, index) => {
            return <div key={'footerDescribe' + index}>{item}</div>;
          })}
        </div>
        <div className={styles['left-community-menu']}>
          {communityMenu?.items.map(
            (menu, index) =>
              menu.iconBig && (
                <span key={'communityMenu' + index} className={styles['left-community-menu-item']}>
                  <menu.iconBig />
                </span>
              ),
          )}
        </div>
      </div>
      {/* right */}
      <div className={clsx('flex-row', styles['right'])}>
        {otherMenus.map((menu) => {
          return (
            <div key={'footerMenus' + menu.group} className={styles['right-menu']}>
              <div className={styles['right-menu-group']}>{menu.group}</div>
              <div className={clsx('flex-column', styles['right-menu-secondMenu'])}>
                {menu.items.map((secondMenu) => {
                  return (
                    <LinkForBlank
                      key={'footerSecondMenu' + secondMenu.name}
                      href={secondMenu.link}
                      className={styles['right-menu-secondMenu-item']}
                      ariaLabel={secondMenu.name}
                      element={
                        <div>
                          {secondMenu.icon && (
                            <span className={styles['secondMenu-item-icon']}>
                              <secondMenu.icon />
                            </span>
                          )}
                          <span className={styles['secondMenu-item-name']}>{secondMenu.name}</span>
                        </div>
                      }
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
