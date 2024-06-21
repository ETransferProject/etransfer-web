import { TFrequentlyAskedQuestionsSection } from 'types/footer';
import styles from './styles.module.scss';
import LinkForBlank from 'components/LinkForBlank';
import clsx from 'clsx';

export default function FAQ({
  title,
  list,
  className,
}: TFrequentlyAskedQuestionsSection & { className?: string }) {
  return (
    <div className={clsx(styles['faq'], className)}>
      <div className={styles['faq-title']}>{title}</div>
      <div className={clsx('flex-column', styles['faq-list'])}>
        {list.map((item, index) => {
          return (
            <LinkForBlank
              key={'FAQ_' + (index + 1)}
              href={item.link}
              className={styles['faq-item']}
              ariaLabel={item.name}
              element={<span className={styles['faq-item-name']}>{item.name}</span>}
            />
          );
        })}
      </div>
    </div>
  );
}
