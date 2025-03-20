import styles from './styles.module.scss';

export function TelegramNotice({ title, walletName }: { title: string; walletName: string }) {
  return (
    <div className={styles['telegram-notice']}>
      <div className={styles['telegram-notice-title']}>{title}</div>
      <div className={styles['telegram-notice-content']}>
        {`${walletName} wallet is temporarily unsupported on Telegram.`}
      </div>
    </div>
  );
}
