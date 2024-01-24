import Copy from 'components/Copy';
import OpenLink from 'components/OpenLink';
import styles from './styles.module.scss';
import clsx from 'clsx';
import CommonModalTips from 'components/CommonModalTips';

export type TViewContractAddressModal = {
  open?: boolean;
  value: string;
  link?: string;
  onOk?: () => void;
};

const ViewContractAddressModalTitle = 'USDT Contract Address on Polygon Network';

export default function ViewContractAddressModal({
  open = false,
  value,
  link,
  onOk,
}: TViewContractAddressModal) {
  return (
    <CommonModalTips
      className={styles.viewContractAddressModal}
      footerClassName={styles.viewContractAddressModalFooter}
      getContainer="body"
      open={open}
      closable={false}
      okText="OK"
      onOk={onOk}>
      <div className={styles.viewContractAddressModalBody}>
        <div className={styles.viewContractAddressModalTitle}>{ViewContractAddressModalTitle}</div>
        <div className={clsx('flex-row-between', styles.viewContractAddressModalContent)}>
          <div className={styles.viewContractAddressModalContract}>{value}</div>
          <div className={clsx('flex-row-start', styles.viewContractAddressModalAction)}>
            {!!value && <Copy className={clsx('flex-none', styles.copyIcon)} toCopy={value} />}
            {!!link && <OpenLink className="flex-none cursor-pointer" href={link} />}
          </div>
        </div>
      </div>
    </CommonModalTips>
  );
}
