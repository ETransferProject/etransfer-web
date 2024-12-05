import { SelectImage } from 'components/SelectToken/TokenCard';
import styles from './styles.module.scss';
import DynamicArrow from 'components/DynamicArrow';
import { useCrossChainTransfer } from 'store/Provider/hooks';
import { formatSymbolDisplay } from 'utils/format';
import { useCallback, useState } from 'react';
import TokenSelectModal from 'components/TokenSelectModal';
import { TTokenItem } from 'types/api';
import clsx from 'clsx';

interface TokenSelectedProps {
  className?: string;
  symbol: string;
  icon?: string;
  onChange?: (item: TTokenItem) => void;
  selectCallback?: (item: TTokenItem) => void;
}

export default function TokenSelected({
  className,
  symbol,
  icon = '',
  onChange,
  selectCallback,
}: TokenSelectedProps) {
  const { tokenList, tokenSymbol } = useCrossChainTransfer();
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
    <>
      <div
        className={clsx('flex-row-center', styles['token-selected'], className)}
        onClick={() => setIsShowTokenSelectModal(true)}>
        <SelectImage
          className={styles['token-logo']}
          icon={icon}
          open={true}
          symbol={formatSymbolDisplay(symbol)}
        />
        <span className={styles['token-selected-name']}>{formatSymbolDisplay(symbol)}</span>
        <DynamicArrow
          className={styles['token-arrow']}
          size={'Small'}
          isExpand={isShowTokenSelectModal}
        />
      </div>

      <TokenSelectModal
        open={isShowTokenSelectModal}
        tokenList={tokenList}
        onSelect={onSelectToken}
        onClose={() => setIsShowTokenSelectModal(false)}
      />
    </>
  );
}
