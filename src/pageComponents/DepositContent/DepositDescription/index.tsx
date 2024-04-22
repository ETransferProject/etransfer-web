import React from 'react';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';

export default function DepositDescription({ list }: { list: string[] }) {
  const { isMobilePX } = useCommonState();
  return (
    <div
      className={clsx(styles['description-wrapper'], {
        [styles['mobile-description-wrapper']]: isMobilePX,
      })}>
      {Array.isArray(list) &&
        list?.map((item, idx) => {
          return (
            <p key={`DepositDescription${idx}`} className={styles['description-item']}>
              • {item}
            </p>
          );
        })}
    </div>
  );
}
