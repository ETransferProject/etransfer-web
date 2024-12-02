import { ReactNode } from 'react';
import clsx from 'clsx';
import Info from 'assets/images/info.svg';
import styles from './styles.module.scss';

interface ICommonPromptCardProps {
  className?: string;
  content: ReactNode | ReactNode[];
}

export default function CommonPromptCard({ className, content }: ICommonPromptCardProps) {
  return (
    <div className={clsx(styles['common-prompt-card'], className)}>
      <Info className={styles['common-prompt-card-icon']} />
      <div className={styles['common-prompt-card-content']}>
        {Array.isArray(content)
          ? content.map((row, index) => <div key={index}>• {row}</div>)
          : content}
      </div>
    </div>
  );
}
