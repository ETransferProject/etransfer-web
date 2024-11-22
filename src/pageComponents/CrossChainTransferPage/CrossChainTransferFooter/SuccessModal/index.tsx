import clsx from 'clsx';
import CheckFilledIcon from 'assets/images/checkFilled.svg';
import CommonModalSwitchDrawer, {
  CommonModalSwitchDrawerProps,
} from 'components/CommonModalSwitchDrawer';
import styles from './styles.module.scss';
import { valueFixed2LessThanMin } from 'utils/calculate';
import { TokenType, DEFAULT_NULL_VALUE } from 'constants/index';
import { useMemo } from 'react';
import { ARRIVAL_TIME_CONFIG } from 'constants/withdraw';
import { AllSupportedELFChainId } from 'constants/chain';
import { GOT_IT } from 'constants/misc';
import { formatSymbolDisplay } from 'utils/format';
import CommonLink from 'components/CommonLink';
import { getTxExploreHref } from 'utils/common';
import { Fingerprint } from 'assets/images';
import { useCommonState, useCrossChainTransfer } from 'store/Provider/hooks';

export interface SuccessModalProps {
  amount: string;
  symbol: string;
  receiveAmount: string;
  receiveAmountUsd: string;
  txHash: string;
  modalProps: CommonModalSwitchDrawerProps;
}

const isNeedQuota = (symbol: TokenType, chainId: AllSupportedELFChainId) => {
  if (!symbol || !chainId) return false;
  if (
    [TokenType.ELF, TokenType.USDT].includes(symbol) &&
    ARRIVAL_TIME_CONFIG[symbol].chainList.includes(chainId)
  )
    return true;
  return false;
};

export default function SuccessModal({
  amount,
  symbol,
  receiveAmount,
  receiveAmountUsd,
  txHash,
  modalProps,
}: SuccessModalProps) {
  const { isPadPX } = useCommonState();
  const { fromNetwork, toNetwork } = useCrossChainTransfer();
  const arrivalTime = useMemo(() => {
    const _symbol = symbol as TokenType;
    const chainId = toNetwork?.network as unknown as AllSupportedELFChainId;
    if (
      isNeedQuota(_symbol, chainId) &&
      Number(amount) <= Number(ARRIVAL_TIME_CONFIG[_symbol].dividingQuota)
    ) {
      return '30s';
    } else {
      return toNetwork?.multiConfirmTime;
    }
  }, [amount, symbol, toNetwork?.multiConfirmTime, toNetwork?.network]);

  return (
    <CommonModalSwitchDrawer
      {...modalProps}
      hideCancelButton
      okText={GOT_IT}
      footerSlot={CommonLink({
        href: getTxExploreHref(fromNetwork.network, txHash, false),
        isTagA: true,
        children: (
          <div className={clsx(styles['link-wrap'], !isPadPX && styles['linkToExplore'])}>
            <span className={styles['link-word']}>View on aelf Explorer</span>
            <Fingerprint className={styles['link-explore-icon']} />
          </div>
        ),
      })}>
      <div className={clsx('flex-column', styles['container'])}>
        <div className={clsx('flex-column-center', styles['title-wrapper'])}>
          <div className={clsx('flex-center', styles['title-icon'])}>
            <CheckFilledIcon />
          </div>
          <div className={styles['title']}>Transfer Submitted</div>
        </div>
        <div className={clsx('flex-column-center', styles['main-info-wrapper'])}>
          <div className={styles['label']}>Amount to Be Received on {toNetwork?.name}</div>
          <div className={styles['value']}>
            <span className={styles['value-center']}>
              {receiveAmount || DEFAULT_NULL_VALUE} {formatSymbolDisplay(symbol)}
            </span>
            <div className={clsx(styles['receive-amount-usd'])}>
              {valueFixed2LessThanMin(receiveAmountUsd, '$ ')}
            </div>
          </div>
        </div>
        <div className={styles['divider']} />
        <div className={clsx('flex-column', styles['detail-wrapper'])}>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Transfer Amount</div>
            <div className={styles['value']}>
              {amount} {formatSymbolDisplay(symbol)}
            </div>
          </div>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Arrival Time</div>
            <div className={styles['value']}>≈ {arrivalTime}</div>
          </div>
        </div>
      </div>
    </CommonModalSwitchDrawer>
  );
}
