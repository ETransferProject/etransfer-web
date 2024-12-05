import clsx from 'clsx';
import SelectChain from 'components/SelectChain';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { IChainNameItem, SupportedELFChainId } from 'constants/index';
import { Aelf, AelfBig, tDVV as TDVV, tDVVBig as TDVVBig } from 'assets/images';
import CommonSpace from 'components/CommonSpace';

interface SelectChainWrapperProps {
  menuItems: IChainNameItem[];
  selectedItem: IChainNameItem;
  className?: string;
  mobileLabel?: string;
  chainChanged: (item: IChainNameItem) => void;
}

export default function SelectChainWrapper({
  menuItems,
  selectedItem,
  className,
  mobileLabel,
  chainChanged,
}: SelectChainWrapperProps) {
  const { isPadPX } = useCommonState();

  return (
    <div
      id="depositChainSelect"
      className={clsx('flex-row-center', styles['select-chain-wrapper'], className)}>
      {isPadPX && <span className={styles['select-chain-label']}>{mobileLabel}</span>}

      {selectedItem.key === SupportedELFChainId.AELF && <>{isPadPX ? <Aelf /> : <AelfBig />}</>}
      {selectedItem.key !== SupportedELFChainId.AELF && <>{isPadPX ? <TDVV /> : <TDVVBig />}</>}

      <CommonSpace direction={'horizontal'} size={isPadPX ? 6 : 8} />

      <SelectChain
        menuItems={menuItems}
        selectedItem={selectedItem}
        clickCallback={chainChanged}
        className={styles['select-chain-container']}
        childrenClassName={styles['select-chain-content']}
      />
    </div>
  );
}
