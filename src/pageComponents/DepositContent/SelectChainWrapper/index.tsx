import clsx from 'clsx';
import SelectChain from 'components/SelectChain';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { IChainNameItem, SupportedELFChainId } from 'constants/index';
import { Aelf, AelfMedium, tDVV as TDVV, tDVVMedium as TDVVMedium } from 'assets/images';
import CommonSpace from 'components/CommonSpace';

interface SelectChainWrapperProps {
  menuItems: IChainNameItem[];
  selectedItem: IChainNameItem;
  className?: string;
  mobileTitle?: string;
  mobileLabel?: string;
  chainChanged: (item: IChainNameItem) => void;
}

export default function SelectChainWrapper({
  menuItems,
  selectedItem,
  className,
  mobileTitle = '',
  mobileLabel,
  chainChanged,
}: SelectChainWrapperProps) {
  const { isPadPX } = useCommonState();

  return (
    <div
      id="depositChainSelect"
      className={clsx('flex-row-center', styles['select-chain-wrapper'], className)}>
      {isPadPX && <span className={styles['select-chain-label']}>{mobileLabel}</span>}

      {selectedItem.key === SupportedELFChainId.AELF && <>{isPadPX ? <Aelf /> : <AelfMedium />}</>}
      {selectedItem.key !== SupportedELFChainId.AELF && <>{isPadPX ? <TDVV /> : <TDVVMedium />}</>}

      <CommonSpace direction={'horizontal'} size={isPadPX ? 6 : 8} />

      <SelectChain
        getContainer="webDepositChainWrapper"
        menuItems={menuItems}
        selectedItem={selectedItem}
        isBorder={false}
        title={mobileTitle}
        clickCallback={chainChanged}
        className={styles['select-chain-container']}
        childrenClassName={styles['select-chain-content']}
        overlayClassName={styles['select-chain-overlay']}
        suffixArrowSize={isPadPX ? 'Small' : 'Normal'}
      />
    </div>
  );
}
