import Copy, { CopySize } from 'components/Copy';
import OpenLink from 'components/OpenLink';
import styles from './styles.module.scss';
import clsx from 'clsx';
import CommonModalTips from 'components/CommonModalTips';
import { CommonModalProps } from 'components/CommonModal';
import { GOT_IT } from 'constants/misc';

export type TViewContractAddressModal = {
  open?: boolean;
  network: string;
  value: string;
  link?: string;
  getContainer?: CommonModalProps['getContainer'];
  onOk?: () => void;
};

const ViewContractAddressModalTitle = 'Contract Address on ';

export default function ViewContractAddressModal({
  open = false,
  network,
  value,
  link,
  getContainer,
  onOk,
}: TViewContractAddressModal) {
  return (
    <CommonModalTips
      className={styles.viewContractAddressModal}
      footerClassName={styles.viewContractAddressModalFooter}
      getContainer={getContainer}
      open={open}
      closable={false}
      okText={GOT_IT}
      onOk={onOk}>
      <div className={styles.viewContractAddressModalBody}>
        <div className={styles.viewContractAddressModalTitle}>
          {ViewContractAddressModalTitle}
          {network}
        </div>
        <div className={clsx('flex-row-between', styles.viewContractAddressModalContent)}>
          <div className={styles.viewContractAddressModalContract}>{value}</div>
          <div className={clsx('flex-row-start', styles.viewContractAddressModalAction)}>
            {!!value && (
              <Copy
                className={clsx('flex-none', styles.copyIcon)}
                toCopy={value}
                size={CopySize.Big}
              />
            )}
            {!!link && <OpenLink className="flex-none cursor-pointer" href={link} />}
          </div>
        </div>
      </div>
    </CommonModalTips>
  );
}
