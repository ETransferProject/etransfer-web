import Remind from 'components/Remind';
import { useCallback, useMemo } from 'react';
import styles from './styles.module.scss';
import NetworkLogo from 'components/NetworkLogo';
import { formatSymbolDisplay } from 'utils/format';
import Copy from 'components/Copy';
import CommonQRCode from 'components/CommonQRCode';
import CommonButton, { CommonButtonSize } from 'components/CommonButton';
import { CheckFilled16 } from 'assets/images';
import clsx from 'clsx';

export default function InitializeLiquidityPool() {
  const list = useMemo(() => {
    return [
      {
        network: 'AELF',
        name: 'aelf MainChain',
        receivedAmount: '3616.4747',
        totalAmount: '1000000',
        address: 'ELF_24o1XG3ryAB7wnchtPGzar7GWw68mhD1UEW7KGKxyE3tQUb7TT_tDVV',
        symbol: 'SGR-1',
        tokenIcon: '',
      },
      {
        network: 'tDVW',
        name: 'aelf dAppChain',
        receivedAmount: '1000000',
        totalAmount: '1000000',
        address: 'ELF_24o1XG3ryAB7wnchtPGzar7GWw68mhD1UEW7KGKxyE3tQUb7TT_tDVV',
        symbol: 'SGR-1',
        tokenIcon: '',
      },
    ];
  }, []);

  const renderRemind = useMemo(() => {
    return (
      <Remind className={styles['remind']} iconClassName={styles['remind-icon']} isBorder={false}>
        <div>
          <div className={styles['tip-row']}>
            • Please transfer the SGR for each chain into the liquidity pool.
          </div>
          <div className={styles['tip-row']}>• Transferring other tokens will be invalid.</div>
          <div className={styles['tip-row']}>
            • The 24-hour transfer limit for the SGR is $5,000.
          </div>
        </div>
      </Remind>
    );
  }, []);

  const handleGoExplore = useCallback(() => {
    // TODO
  }, []);

  const renderList = useMemo(() => {
    return (
      <div>
        {list.map((item, index) => {
          return (
            <div
              key={'initialize-liquidity-pool-list-' + index}
              className={styles['initialize-liquidity-pool-item']}>
              <div className="flex-row-center-between">
                <div className="flex-row-center gap-8">
                  <NetworkLogo network={item.network} />
                  <span className={styles['network-name']}>{item.name}</span>
                </div>
                {item.receivedAmount === item.totalAmount ? (
                  <div className={'flex-row-center gap-8'}>
                    <CheckFilled16 />
                    <span>Token pool initialization completed</span>
                  </div>
                ) : (
                  <div className={clsx('flex-row-center', styles['amount-rate'])}>
                    <span>Received&nbsp;</span>
                    <span className={styles['action']}>
                      {item.receivedAmount}&nbsp;{formatSymbolDisplay(item.symbol)}
                    </span>
                    <span>
                      /{item.totalAmount}&nbsp;{formatSymbolDisplay(item.symbol)}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles['address-info']}>
                <CommonQRCode size={120} value={item.address} logoUrl={item.tokenIcon} />
                <div>
                  <div className={styles['address-desc']}>
                    <span>Transfer&nbsp;</span>
                    <span className={styles['action']} onClick={handleGoExplore}>
                      {formatSymbolDisplay(item.symbol)}
                    </span>
                    <span>&nbsp;on the&nbsp;</span>
                    <span>{item.name}</span>
                    <span>to the address below:</span>
                  </div>
                  <div className="flex-row-center gap-8">
                    <div className={styles['address']}>{item.address}</div>
                    <Copy toCopy={item.address} className="flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [handleGoExplore, list]);

  return (
    <div className={styles['initialize-liquidity-pool']}>
      {renderRemind}
      {renderList}
      <CommonButton
        className={styles['submit-button']}
        size={CommonButtonSize.Small}
        disabled={true} // TODO
      >
        Submit
      </CommonButton>
    </div>
  );
}
