import clsx from 'clsx';
import SelectChain from 'components/SelectChain';
import { useCommonState, useDepositState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { IChainNameItem, TokenType } from 'constants/index';
import { Aelf } from 'assets/images';
import { useMemo } from 'react';

interface SelectChainWrapperProps {
  menuItems: IChainNameItem[];
  selectedItem: IChainNameItem;
  className?: string;
  mobileTitle?: string;
  mobileLabel?: string;
  webLabel?: string;
  chainChanged: (item: IChainNameItem) => void;
}

export default function SelectChainWrapper({
  menuItems,
  selectedItem,
  className,
  mobileTitle = '',
  mobileLabel,
  webLabel,
  chainChanged,
}: SelectChainWrapperProps) {
  const { isMobilePX } = useCommonState();
  const { toTokenSymbol } = useDepositState();
  const isDisabled = useMemo(() => !!toTokenSymbol.includes(TokenType.SGR), [toTokenSymbol]);

  return (
    <div className={clsx('flex-row-center', styles['select-chain-wrapper'], className)}>
      <span className={styles['select-chain-label']}>{isMobilePX ? mobileLabel : webLabel}</span>
      <div className={styles['space-6']} />
      <Aelf />
      <div className={styles['space-6']} />
      {isDisabled ? (
        <div className={styles['select-chain']}>{selectedItem.label}</div>
      ) : (
        <SelectChain
          menuItems={menuItems}
          selectedItem={selectedItem}
          isBorder={false}
          title={mobileTitle}
          clickCallback={chainChanged}
          className={styles['select-chain-container']}
          childrenClassName={styles['select-chain-content']}
          suffixArrowSize="Small"
        />
      )}
    </div>
  );
}
