import clsx from 'clsx';
import SelectChain from 'components/SelectChain';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { ChainNameItem } from 'constants/index';

interface SelectChainWrapperProps {
  className?: string;
  mobileTitle?: string;
  mobileLabel?: string;
  webLabel?: string;
  chainChanged: (item: ChainNameItem) => void;
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
    <div className={clsx(styles['select-chain-wrapper'], className)}>
      <span className={styles['select-chain-label']}>{isMobilePX ? mobileLabel : webLabel}</span>
      <SelectChain title={mobileTitle} clickCallback={chainChanged} />
    </div>
  );
}
