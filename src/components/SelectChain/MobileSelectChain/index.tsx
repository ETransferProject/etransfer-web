import clsx from 'clsx';
import DynamicArrow from 'components/DynamicArrow';
import { DeviceSelectChainProps } from '../types';
import { CHAIN_NAME_ENUM } from 'constants/index';
import styles from './styles.module.scss';

export default function MobileSelectChain({
  className,
  childrenClassName,
  selectedItem,
  isExpand = false,
  onClick,
}: DeviceSelectChainProps) {
  return (
    <div
      className={clsx('flex-row-center', styles['trigger-container'], className)}
      onClick={onClick}>
      <div className={clsx(styles['trigger-text'], childrenClassName)}>
        {selectedItem?.label.includes('AELF')
          ? CHAIN_NAME_ENUM.MainChain
          : selectedItem?.label.includes('SideChain')
          ? CHAIN_NAME_ENUM.SideChain
          : selectedItem?.label}
      </div>
      <DynamicArrow isExpand={isExpand} size="Small" className={styles['children-icon']} />
    </div>
  );
}
