import NetworkLogo, { TNetworkLogoSize } from 'components/NetworkLogo';
import styles from './styles.module.scss';
import { useMemo } from 'react';
import clsx from 'clsx';
import CommonTooltip from 'components/CommonTooltip';
import { useCommonState } from 'store/Provider/hooks';
import CommonSpace from 'components/CommonSpace';
import { formatNetworkName } from 'utils/format';

interface NetworksProps {
  list: string[];
  size?: TNetworkLogoSize;
  className?: string;
}

export default function Networks({ list, size = 'big', className }: NetworksProps) {
  const { isPadPX } = useCommonState();
  const renderMore = useMemo(() => {
    const moreList = list.slice(2, list.length);
    const moreListLogo = (
      <div className={clsx('row-center', styles['network-more'])}>
        {moreList.map((item, index) => {
          return (
            <div className="flex-row" key={`tooltip-networks-${item}`}>
              <NetworkLogo network={item} size={size} className={styles['network-more-icon']} />
              {index < moreList.length - 1 && <CommonSpace direction={'horizontal'} size={12} />}
            </div>
          );
        })}
      </div>
    );

    return (
      <CommonTooltip
        title={moreListLogo}
        trigger={isPadPX ? '' : 'hover'}
        overlayClassName={styles['networks-more-tooltip']}>
        <div
          className={clsx(
            'row-center',
            'flex-shrink-0',
            styles['network-more-number'],
            size === 'small' && styles['network-more-number-small'],
          )}
          style={{
            width: size === 'big' ? 24 : 16,
            height: size === 'big' ? 24 : 16,
          }}>
          {`+${list.length - 2}`}
        </div>
      </CommonTooltip>
    );
  }, [isPadPX, list, size]);

  const renderNetworkList = useMemo(() => {
    if (!list || (Array.isArray(list) && list.length === 0)) return null;

    // 0 - 3
    if (Array.isArray(list) && list.length > 0 && list.length <= 3) {
      return (
        <div className={clsx('flex-row-center', styles['networks-3'], className)}>
          {list?.map((item) => {
            return (
              <CommonTooltip
                key={`networks-${item}`}
                title={formatNetworkName(item)}
                trigger={isPadPX ? '' : 'hover'}
                overlayClassName={styles['networks-more-tooltip']}>
                <div className={styles['logo-container']}>
                  <NetworkLogo network={item} size={size} />
                </div>
              </CommonTooltip>
            );
          })}
        </div>
      );
    }

    // >3
    const listSlice = list.slice(0, 2);
    return (
      <div className={clsx('flex-row-center', styles['network-more-wrapper'], className)}>
        {listSlice?.map((item) => {
          return (
            <CommonTooltip
              key={`networks-${item}`}
              title={item}
              trigger={isPadPX ? '' : 'hover'}
              overlayClassName={styles['networks-more-tooltip']}>
              <div className={styles['logo-container']}>
                <NetworkLogo network={item} size={size} />
              </div>
            </CommonTooltip>
          );
        })}
        {renderMore}
      </div>
    );
  }, [className, isPadPX, list, renderMore, size]);

  return <div className={styles['networks-container']}>{renderNetworkList}</div>;
}
