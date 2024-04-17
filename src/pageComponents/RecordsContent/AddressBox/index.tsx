import styles from './styles.module.scss';
import clsx from 'clsx';
import {
  Aelf,
  Ethereum,
  Polygon,
  Arbitrum,
  Optimism,
  Solana,
  Tron,
  Binance,
  Avax,
} from 'assets/images';
import { useCallback } from 'react';
import { BitNetworkType } from 'constants/network';
import Copy, { CopySize } from 'components/Copy';
import { getOmittedStr } from 'utils/calculate';
import { openWithBlank, getExploreLink } from 'utils/common';
import { SupportedELFChainId } from 'constants/index';
import CommonTooltip from 'components/CommonTooltip';
import { useCommonState } from 'store/Provider/hooks';
import { useAccounts } from 'hooks/portkeyWallet';

type AddressBoxProps = {
  address: string;
  network: string;
  fromChanId: SupportedELFChainId;
  toChanId: SupportedELFChainId;
  orderType: string;
};

export default function AddressBox({
  address,
  network,
  fromChanId,
  toChanId,
  orderType,
}: AddressBoxProps) {
  const { isMobilePX } = useCommonState();
  const accounts = useAccounts();

  const addressIcon = useCallback(() => {
    switch (network) {
      case BitNetworkType.AELF:
        return <Aelf />;
      case BitNetworkType.Ethereum:
        return <Ethereum />;
      case BitNetworkType.Polygon:
        return <Polygon />;
      case BitNetworkType.Arbitrum:
        return <Arbitrum />;
      case BitNetworkType.Optimism:
        return <Optimism />;
      case BitNetworkType.Solana:
        return <Solana />;
      case BitNetworkType.Tron:
        return <Tron />;
      case BitNetworkType.Binance:
        return <Binance />;
      case BitNetworkType.Avax:
        return <Avax />;
      default:
        // when not match network's type, display first character and uppercase
        return <div className={clsx(styles['network'])}>{network?.charAt(0).toUpperCase()}</div>;
    }
  }, [network]);

  const calcAddress = useCallback(() => {
    if (network === BitNetworkType.AELF && !address) {
      let chanId: SupportedELFChainId = orderType === 'Deposit' ? toChanId : fromChanId;
      chanId = chanId ?? SupportedELFChainId.AELF;
      if (accounts && accounts[chanId] && accounts[chanId]?.[0]) {
        return accounts[chanId]?.[0] || '--';
      }
      return '--';
    }
    return address;
  }, [network, address, accounts, orderType, toChanId, fromChanId]);

  const handleAddressClick = useCallback(() => {
    // link to Deposit: toTransfer.chainId and Withdraw: fromTransfer.chainId
    openWithBlank(
      getExploreLink(calcAddress(), 'address', orderType === 'Deposit' ? toChanId : fromChanId),
    );
  }, [orderType, fromChanId, toChanId, calcAddress]);

  return (
    <div
      className={clsx(
        styles['addressBox'],
        isMobilePX ? styles['mobil-addressBox'] : styles['web-addressBox'],
      )}>
      {addressIcon()}
      <CommonTooltip title={calcAddress()} trigger={'hover'}>
        <span className={clsx(styles['address-word'])} onClick={handleAddressClick}>
          {getOmittedStr(calcAddress(), 8, 9)}
        </span>
      </CommonTooltip>
      <Copy toCopy={calcAddress()} size={CopySize.Small} />
    </div>
  );
}
