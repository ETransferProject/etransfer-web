import { useCallback, useState } from 'react';
import clsx from 'clsx';
import DynamicArrow from 'components/DynamicArrow';
import TokenSelectModal from 'components/TokenSelectModal';
import LinkForBlank from 'components/LinkForBlank';
import TokenRow from '../../TokenRow';
import { CheckFilled16, CloseFilled16 } from 'assets/images';
import { TTokenItem } from 'types/listing';
import styles from './styles.module.scss';
import { HOLDERS_MIN_VALUE, LIQUIDITY_IN_USD_MIN_VALUE } from 'constants/listing';

interface ITokenSelectProps {
  className?: string;
  token?: TTokenItem;
  tokenList: TTokenItem[];
  placeholder?: string;
  selectCallback?: (item: TTokenItem) => void;
}

export default function TokenSelect({
  className,
  token,
  tokenList,
  placeholder,
  selectCallback,
}: ITokenSelectProps) {
  const [isShowTokenSelectModal, setIsShowTokenSelectModal] = useState(false);

  const getInfoValidateIcon = useCallback((isPass: boolean) => {
    return isPass ? <CheckFilled16 /> : <CloseFilled16 />;
  }, []);

  const onSelectToken = useCallback(
    async (item: TTokenItem) => {
      setIsShowTokenSelectModal(false);
      selectCallback?.(item);
    },
    [selectCallback],
  );

  return (
    <>
      <div className={styles['token-selected-wrapper']}>
        <div
          className={clsx(styles['token-selected'], className)}
          onClick={() => setIsShowTokenSelectModal(true)}>
          {token ? (
            <TokenRow symbol={token.symbol} name={token.name} icon={token.icon} />
          ) : (
            <span className={styles['token-selected-placeholder']}>{placeholder}</span>
          )}
          <DynamicArrow isExpand={isShowTokenSelectModal} />
        </div>

        {token && (
          <div className={styles['token-selected-info-card']}>
            <div className={styles['token-selected-info-card-row']}>
              <div className={styles['token-selected-info-card-row-content']}>
                {getInfoValidateIcon(
                  !!token?.liquidityInUsd &&
                    parseFloat(token.liquidityInUsd) > LIQUIDITY_IN_USD_MIN_VALUE,
                )}
                <span>{`Liquidity > $${LIQUIDITY_IN_USD_MIN_VALUE}`}</span>
              </div>
              <LinkForBlank
                className={styles['token-selected-info-card-row-link']}
                href={'/'}
                element="Add Liquidity"
              />
            </div>
            <div className={styles['token-selected-info-card-row']}>
              <div className={styles['token-selected-info-card-row-content']}>
                {getInfoValidateIcon(!!token?.holders && token.holders > HOLDERS_MIN_VALUE)}
                <span>{`Holders > ${HOLDERS_MIN_VALUE}`}</span>
              </div>
            </div>
          </div>
        )}
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
