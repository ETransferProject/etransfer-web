import { TRecordDetailStep } from 'types/api';
import styles from './styles.module.scss';
import { Steps } from 'antd';

const description = 'description';
const items = [
  {
    title: 'Finished',
    description,
  },
  {
    title: 'In Progress',
    description,
  },
  {
    title: 'Waiting',
    description,
  },
  {
    title: 'Waiting',
    description,
  },
];

export default function HistoryDetailStep(props: TRecordDetailStep) {
  return (
    <div className={styles['history-detail-step']}>
      <Steps current={1} size="small" labelPlacement="vertical" items={items} />
    </div>
  );
}
