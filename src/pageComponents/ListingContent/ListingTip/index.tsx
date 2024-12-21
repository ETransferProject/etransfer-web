import { InfoLineIcon } from 'assets/images';
import CommonTooltipSwitchModal, {
  ICommonTooltipSwitchModalRef,
} from 'components/CommonTooltipSwitchModal';
import { useRef } from 'react';
import styles from './styles.module.scss';

export default function ListingTip({
  tip,
  title,
  modalTitle,
}: {
  tip: React.ReactNode;
  title?: string;
  modalTitle?: string;
}) {
  const tooltipSwitchModalsRef = useRef<ICommonTooltipSwitchModalRef | null>(null);

  return (
    <CommonTooltipSwitchModal
      ref={(ref) => {
        tooltipSwitchModalsRef.current = ref;
      }}
      modalProps={{ title: modalTitle || title, zIndex: 300 }}
      tip={tip}>
      <div className={styles['tip-title']} onClick={() => tooltipSwitchModalsRef.current?.open()}>
        <InfoLineIcon className={styles['tip-title-icon']} />
        <span className={styles['tip-title-text']}>{title}</span>
      </div>
    </CommonTooltipSwitchModal>
  );
}
