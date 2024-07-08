import NetworkLogo, { TNetworkLogoSize } from 'components/NetworkLogo';
import styles from './styles.module.scss';
import { useMemo } from 'react';
import clsx from 'clsx';
import CommonTooltip from 'components/CommonTooltip';
import { useCommonState } from 'store/Provider/hooks';

interface NetworksProps {
  list: any[];
  size?: TNetworkLogoSize;
}

export default function Networks({ list, size = 'normal' }: NetworksProps) {
  const { isPadPX } = useCommonState();
  const renderMore = useMemo(() => {
    const moreList = list.slice(3, list.length);
    const moreListLogo = (
      <div className={clsx('row-center', styles['network-more'])}>
        {moreList.map((item) => {
          return (
            <NetworkLogo
              key={`tooltip-networks-${item.network}`}
              network={item.network}
              size={size}
            />
          );
        })}
      </div>
    );
    return (
      <CommonTooltip
        title={moreListLogo}
        trigger={isPadPX ? '' : 'hover'}
        // open={isPadPX ? isTooltipOpen : undefined}
      >
        <div
          className={styles['network-more-number']}
          style={{ width: size === 'normal' ? 24 : 16, height: size === 'normal' ? 24 : 16 }}>
          {`+${list.length - 3}`}
        </div>
      </CommonTooltip>
    );
  }, []);

  const renderNetworkList = useMemo(() => {
    if (!list || (Array.isArray(list) && list.length === 0)) return null;

    // 0 - 3
    if (Array.isArray(list) && list.length > 0 && list.length <= 3) {
      return (
        <div className={clsx('flex-row-center', styles['networks-3'])}>
          {list?.map((item) => {
            return (
              <NetworkLogo key={`networks-${item.network}`} network={item.network} size={size} />
            );
          })}
        </div>
      );
    }

    // >3
    const listSlice = list.slice(0, 3);
    return (
      <div className={clsx('flex-row-center', styles['network-more'])}>
        {listSlice?.map((item) => {
          return (
            <NetworkLogo key={`networks-${item.network}`} network={item.network} size={size} />
          );
        })}
        {renderMore}
      </div>
    );
  }, [list, size]);

  return <div className={styles['networks-container']}>{renderNetworkList}</div>;
}
