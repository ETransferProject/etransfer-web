import DynamicArrow from 'components/DynamicArrow';
import { CHAIN_NAME_ENUM } from 'constants/index';
import { DeviceSelectChainProps } from '../types';
import styles from './styles.module.scss';

export default function WebSelectChain({
  selectedItem,
  isExpand,
  onClick,
}: DeviceSelectChainProps) {
  return (
    <div className={styles['trigger-text']} onClick={onClick}>
      <div>
        {selectedItem?.label.includes('AELF')
          ? CHAIN_NAME_ENUM.MainChain
          : selectedItem?.label.includes('SideChain')
          ? CHAIN_NAME_ENUM.SideChain
          : selectedItem?.label}
      </div>
      <DynamicArrow isExpand={isExpand} className={styles['children-icon']} />
    </div>
  );
}
