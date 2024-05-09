import clsx from 'clsx';
import SelectChain from 'components/SelectChain';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { IChainNameItem } from 'constants/index';
import { Aelf } from 'assets/images';

interface SelectChainWrapperProps {
  className?: string;
  mobileTitle?: string;
  mobileLabel?: string;
  webLabel?: string;
  chainChanged: (item: IChainNameItem) => void;
}

export default function SelectChainWrapper({
  className,
  mobileTitle = '',
  mobileLabel,
  webLabel,
  chainChanged,
}: SelectChainWrapperProps) {
  const { isMobilePX } = useCommonState();

  return (
    <div className={clsx('flex-row-center', styles['select-chain-wrapper'], className)}>
      <span className={styles['select-chain-label']}>{isMobilePX ? mobileLabel : webLabel}</span>
      <div className={styles['space-6']} />
      <Aelf />
      <div className={styles['space-6']} />
      <SelectChain
        isBorder={false}
        title={mobileTitle}
        clickCallback={chainChanged}
        className={styles['select-chain-container']}
        childrenClassName={styles['select-chain-content']}
        suffixArrowSize="Small"
      />
    </div>
  );
}
