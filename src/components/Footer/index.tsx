import { FOOTER_CONFIG } from 'constants/footer';
import styles from './styles.module.scss';
import LinkForBlank from 'components/LinkForBlank';
import clsx from 'clsx';

export default function Footer() {
  return (
    <div className={clsx('flex-row-between', styles['footer'])}>
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
      </div>
      {/* right */}
      <div className={clsx('flex-row-between', styles['right'])}>
        {FOOTER_CONFIG.menus.map((menu) => {
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
