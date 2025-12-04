import DisplayImage from 'components/DisplayImage';
import styles from './styles.module.scss';
import DynamicArrow from 'components/DynamicArrow';
import { useWithdrawNewState } from 'store/Provider/hooks';
import { formatSymbolDisplay } from 'utils/format';
import { useCallback, useState } from 'react';
import TokenSelectModal from 'components/TokenSelectModal';
import { TTokenItem } from 'types/api';
import clsx from 'clsx';

interface TokenSelectedWrapperProps {
  className?: string;
  label?: string;
  symbol: string;
  name: string;
  icon?: string;
  onChange?: (item: TTokenItem) => void;
  selectCallback?: (item: TTokenItem) => void;
}

export default function TokenSelectedWrapper({
  className,
  label,
  symbol,
  name,
  icon = '',
  onChange,
  selectCallback,
}: TokenSelectedWrapperProps) {
  const { tokenList, tokenSymbol } = useWithdrawNewState();
  const [isShowTokenSelectModal, setIsShowTokenSelectModal] = useState(false);

  const onSelectToken = useCallback(
    async (item: TTokenItem) => {
      if (item.symbol === tokenSymbol) {
        setIsShowTokenSelectModal(false);
        return;
      }
      onChange?.(item);
      setIsShowTokenSelectModal(false);

      selectCallback?.(item);
    },
    [onChange, selectCallback, tokenSymbol],
  );

  return (
    <div className={styles['token-selected-wrapper']}>
      <div className={styles['token-selected-label']}>{label}</div>

      <div
        className={clsx('flex-row-center-between', styles['token-selected'], className)}
        onClick={() => setIsShowTokenSelectModal(true)}>
        <div className="flex-row-center">
          <DisplayImage
            className={styles['token-logo']}
            src={icon}
            name={formatSymbolDisplay(symbol)}
          />
          <span className={styles['token-selected-symbol']}>{formatSymbolDisplay(symbol)}</span>
          <span className={styles['token-selected-name']}>{formatSymbolDisplay(name)}</span>
        </div>
        <DynamicArrow size={'Normal'} isExpand={isShowTokenSelectModal} />
      </div>

      <TokenSelectModal
        open={isShowTokenSelectModal}
        tokenList={tokenList}
        onSelect={onSelectToken}
        onClose={() => setIsShowTokenSelectModal(false)}
      />
    </div>
  );
}
