import { useCallback, useState } from 'react';
import clsx from 'clsx';
import DynamicArrow from 'components/DynamicArrow';
import TokenSelectModal from 'components/TokenSelectModal';
import LinkForBlank from 'components/LinkForBlank';
import TokenRow from '../../TokenRow';
import { CheckFilled16, CloseFilled16 } from 'assets/images';
import { TTokenItem } from 'types/api';
import styles from './styles.module.scss';

interface ITokenSelectProps {
  className?: string;
  symbol: string;
  name: string;
  icon?: string;
  placeholder?: string;
  onChange?: (item: TTokenItem) => void;
  selectCallback?: (item: TTokenItem) => void;
}

const tokenList: TTokenItem[] = [
  {
    symbol: 'TokenSymbol',
    name: 'TokenName',
    icon: 'https://raw.githubusercontent.com/Awaken-Finance/assets/main/blockchains/AELF/assets/SGR-1/logo24%403x.png',
    decimals: 18,
    contractAddress: '0x0000000000000000000000000000000000000000',
  },
];
const tokenSymbol = 'TokenSymbol';

export default function TokenSelect({
  className,
  symbol,
  name,
  icon = '',
  placeholder,
  onChange,
  selectCallback,
}: ITokenSelectProps) {
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
    [onChange, selectCallback],
  );

  return (
    <>
      <div className={styles['token-selected-wrapper']}>
        <div
          className={clsx(styles['token-selected'], className)}
          onClick={() => setIsShowTokenSelectModal(true)}>
          {symbol ? (
            <TokenRow symbol={symbol} name={name} icon={icon} />
          ) : (
            <span className={styles['token-selected-placeholder']}>{placeholder}</span>
          )}
          <DynamicArrow isExpand={isShowTokenSelectModal} />
        </div>
        <div className={styles['token-selected-info-card']}>
          <div className={styles['token-selected-info-card-row']}>
            <div className={styles['token-selected-info-card-row-content']}>
              <CheckFilled16 />
              <span>{'Liquidity > $1000'}</span>
            </div>
            <LinkForBlank
              className={styles['token-selected-info-card-row-link']}
              href={'/'}
              element="Add Liquidity"
            />
          </div>
          <div className={styles['token-selected-info-card-row']}>
            <div className={styles['token-selected-info-card-row-content']}>
              <CloseFilled16 />
              <span>{'Holders > 1000'}</span>
            </div>
          </div>
        </div>
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
