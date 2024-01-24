import clsx from 'clsx';
import styles from './styles.module.scss';
import { CONTRACT_ADDRESS } from 'constants/deposit';
import { QuestionMarkIcon } from 'assets/images';
import ViewContractAddressModal from 'pageComponents/ViewContractAddressModal';
import { useCallback, useState } from 'react';
import { formatStr2Ellipsis } from 'utils/format';

export function ContractAddressForMobile({
  label = CONTRACT_ADDRESS,
  address,
  explorerUrl,
}: {
  label?: string;
  address: string;
  explorerUrl?: string;
}) {
  const [openModal, setOpenModal] = useState(false);
  const handleView = useCallback(() => {
    setOpenModal(true);
  }, []);

  return (
    <div className={clsx('flex-row-start', styles['contract-address-for-mobile'])}>
      <div className={clsx('flex-none', styles['info-label'])}>{`${label}:`}</div>
      <div className={clsx('flex-row-start', styles['info-value'])} onClick={handleView}>
        {formatStr2Ellipsis(address, [6, 6])} <QuestionMarkIcon />
      </div>

      <ViewContractAddressModal
        open={openModal}
        value={address}
        link={explorerUrl}
        onConfirm={() => setOpenModal(false)}
      />
    </div>
  );
}

export function ContractAddressForWeb({
  label = CONTRACT_ADDRESS,
  address,
  explorerUrl,
}: {
  label?: string;
  address: string;
  explorerUrl?: string;
}) {
  return (
    <div className={clsx('flex-row-start', styles['contract-address-for-web'])}>
      <div className={clsx('flex-none', styles['info-label'])}>{label}</div>
      <div className={clsx('flex-1', 'flex-row-content-end')}>
        <span
          className={clsx('text-right', 'text-break', styles['info-value'], {
            'text-link': !!explorerUrl,
          })}
          onClick={() => {
            if (explorerUrl) {
              window?.open(explorerUrl, '_blank');
            }
          }}>
          {address}
        </span>
      </div>
    </div>
  );
}
