import { InfoLineIcon } from 'assets/images';
import CommonTooltipSwitchModal, {
  ICommonTooltipSwitchModalRef,
} from 'components/CommonTooltipSwitchModal';
import { useRef } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

export default function CommonTip({
  className,
  tip,
  title,
  modalTitle,
  icon,
}: {
  className?: string;
  tip: React.ReactNode;
  title?: string;
  modalTitle?: string;
  icon?: React.ReactNode;
}) {
  const tooltipSwitchModalsRef = useRef<ICommonTooltipSwitchModalRef | null>(null);

  return (
    <CommonTooltipSwitchModal
      ref={(ref) => {
        tooltipSwitchModalsRef.current = ref;
      }}
      modalProps={{ title: modalTitle || title, zIndex: 300 }}
      tip={tip}>
      <div
        className={clsx(styles['common-tip-title'], className)}
        onClick={() => tooltipSwitchModalsRef.current?.open()}>
        {icon ? icon : <InfoLineIcon className={styles['common-tip-title-icon']} />}
        {title && <span className={styles['common-tip-title-text']}>{title}</span>}
      </div>
    </CommonTooltipSwitchModal>
  );
}
