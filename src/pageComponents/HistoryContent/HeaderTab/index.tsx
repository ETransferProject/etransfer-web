import clsx from 'clsx';
import styles from './styles.module.scss';

export enum EHeaderTab {
  TRANSFER = 'Transfer',
  DEPOSIT = 'Deposit',
}

interface IHeaderTabProps {
  className?: string;
  activeTab: EHeaderTab;
  onChange: (tab: EHeaderTab) => void;
}

const HEADER_TAB_LIST = [
  {
    label: EHeaderTab.TRANSFER,
    value: EHeaderTab.TRANSFER,
  },
  {
    label: EHeaderTab.DEPOSIT,
    value: EHeaderTab.DEPOSIT,
  },
];

export default function HeaderTab({ className, activeTab, onChange }: IHeaderTabProps) {
  return (
    <div className={clsx('flex-row-center', styles['header-tab'], className)}>
      {HEADER_TAB_LIST.map((item) => (
        <div
          key={item.value}
          className={clsx(
            'flex-row-center',
            styles['header-tab-item'],
            activeTab === item.value && styles['header-tab-item-active'],
          )}
          onClick={() => onChange(item.value)}>
          {item.label}
        </div>
      ))}
    </div>
  );
}
