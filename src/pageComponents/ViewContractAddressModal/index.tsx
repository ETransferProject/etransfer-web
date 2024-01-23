import CommonModal from 'components/CommonModal';
import Copy from 'components/Copy';
import OpenLink from 'components/OpenLink';
import styles from './styles.module.scss';
import clsx from 'clsx';

export type TViewContractAddressModal = {
  value: string;
};

const ViewContractAddressModalTitle = 'USDT Contract Address on Polygon Network';

export default function ViewContractAddressModal({ value }: TViewContractAddressModal) {
  return (
    <CommonModal
      className={styles.viewContractAddressModal}
      footerClassName={styles.viewContractAddressModalFooter}
      open={true}
      closable={false}
      hideCancelButton={true}>
      <div className={styles.viewContractAddressModalBody}>
        <div className={styles.viewContractAddressModalTitle}>{ViewContractAddressModalTitle}</div>
        <div className={clsx('flex-row-between', styles.viewContractAddressModalContent)}>
          <div className={styles.viewContractAddressModalContract}>{value}</div>
          <div className={clsx('flex-row-start', styles.viewContractAddressModalAction)}>
            {!!value && (
              <Copy className={clsx('flex-none', styles.copyIcon)} toCopy={value || ''} />
            )}
            {!!value && <OpenLink className={'flex-none'} href={value || ''} />}
          </div>
        </div>
      </div>
    </CommonModal>
  );
}
