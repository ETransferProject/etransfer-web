import clsx from 'clsx';
import { TRecordsRequestType } from 'types/records';
import styles from './styles.module.scss';

interface IHeaderTabProps {
  className?: string;
  activeTab: TRecordsRequestType;
  onChange: (tab: TRecordsRequestType) => void;
}

const HEADER_TAB_LIST = [
  {
    label: 'Transfer',
    value: TRecordsRequestType.Transfer,
  },
  {
    label: 'Deposit',
    value: TRecordsRequestType.Deposit,
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
