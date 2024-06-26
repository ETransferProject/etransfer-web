import clsx from 'clsx';
import SelectChain from 'components/SelectChain';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { IChainNameItem } from 'constants/index';
import { Aelf, AelfMedium } from 'assets/images';
import { useMemo } from 'react';
import Space from 'components/Space';

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
  const isDisabled = useMemo(() => {
    return menuItems?.length <= 1;
  }, [menuItems?.length]);

  return (
    <div
      id="depositChainSelect"
      className={clsx('flex-row-center', styles['select-chain-wrapper'], className)}>
      {isPadPX && <span className={styles['select-chain-label']}>{mobileLabel}</span>}

      {isPadPX ? <Aelf /> : <AelfMedium />}
      <Space direction={'horizontal'} size={isPadPX ? 6 : 8} />

      {isDisabled ? (
        <div className={styles['select-chain']}>{selectedItem.label}</div>
      ) : (
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
      )}
    </div>
  );
}
