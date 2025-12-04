import { useCallback, useState } from 'react';
import clsx from 'clsx';
import DynamicArrow from 'components/DynamicArrow';
import TokenSelectModal from 'components/TokenSelectModal';
import LinkForBlank from 'components/LinkForBlank';
import TokenRow from '../../TokenRow';
import { CheckFilled16, CloseFilled16 } from 'assets/images';
import { TTokenConfig, TTokenItem } from 'types/listing';
import { AwakenHost } from 'constants/index';
import styles from './styles.module.scss';
import { LISTING_TOKEN_TIP } from 'constants/listing';

interface ITokenSelectProps {
  className?: string;
  token?: TTokenItem;
  tokenList: TTokenItem[];
  tokenConfig?: TTokenConfig;
  placeholder?: string;
  selectCallback?: (item: TTokenItem) => void;
}

export default function TokenSelect({
  className,
  token,
  tokenList,
  tokenConfig,
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
            {!!tokenConfig?.liquidityInUsd && (
              <div className={styles['token-selected-info-card-row']}>
                <div className={styles['token-selected-info-card-row-content']}>
                  {getInfoValidateIcon(
                    !!token?.liquidityInUsd &&
                      parseFloat(token.liquidityInUsd) > parseFloat(tokenConfig.liquidityInUsd),
                  )}
                  <span>{`Liquidity > $${tokenConfig.liquidityInUsd}`}</span>
                </div>
                <LinkForBlank
                  className={styles['token-selected-info-card-row-link']}
                  href={AwakenHost}
                  element="Add Liquidity"
                />
              </div>
            )}
            {tokenConfig?.holders !== undefined && (
              <div className={styles['token-selected-info-card-row']}>
                <div className={styles['token-selected-info-card-row-content']}>
                  {getInfoValidateIcon(!!token?.holders && token.holders > tokenConfig.holders)}
                  <span>{`Holders > ${tokenConfig.holders}`}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <TokenSelectModal
        hideAddToken
        open={isShowTokenSelectModal}
        tokenList={tokenList}
        remindContent={LISTING_TOKEN_TIP}
        onSelect={onSelectToken}
        onClose={() => setIsShowTokenSelectModal(false)}
      />
    </>
  );
}
