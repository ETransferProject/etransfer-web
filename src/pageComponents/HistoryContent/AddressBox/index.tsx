import styles from './styles.module.scss';
import clsx from 'clsx';
import { useCallback } from 'react';
import {
  AelfExploreType,
  BlockchainNetworkType,
  ExploreUrlType,
  OtherExploreType,
} from 'constants/network';
import { SupportedChainId, defaultNullValue } from 'constants/index';
import Copy, { CopySize } from 'components/Copy';
import { getOmittedStr } from 'utils/calculate';
import { openWithBlank, getAelfExploreLink, getOtherExploreLink } from 'utils/common';
import { addressFormat } from 'utils/aelfBase';
import { SupportedELFChainId } from 'constants/index';
import CommonTooltip from 'components/CommonTooltip';
import { useCommonState } from 'store/Provider/hooks';
import { useAccounts } from 'hooks/portkeyWallet';
import NetworkLogo from 'components/NetworkLogo';

type TAddressBoxProps = {
  type: 'To' | 'From';
  fromAddress: string;
  toAddress: string;
  network: string;
  fromChainId: SupportedELFChainId;
  toChainId: SupportedELFChainId;
  fromToAddress: string;
  toFromAddress: string;
};

export default function AddressBox({
  type,
  fromAddress,
  toAddress,
  network,
  fromChainId,
  toChainId,
}: TAddressBoxProps) {
  const { isMobilePX } = useCommonState();
  const accounts = useAccounts();

  const calcAddress = useCallback(() => {
    const address = type === 'To' ? toAddress : fromAddress;
    if (address && network === BlockchainNetworkType.AELF) {
      // format address: add suffix
      const chainId: SupportedELFChainId = type === 'To' ? toChainId : fromChainId;
      return addressFormat(address, chainId || SupportedChainId.sideChain);
    }
    if (!address && network === BlockchainNetworkType.AELF) {
      // when fromAddress and toAddress all null, need accounts default address
      let chainId: SupportedELFChainId = type === 'To' ? toChainId : fromChainId;
      chainId = chainId || SupportedChainId.sideChain;
      if (accounts && accounts[chainId] && accounts[chainId]?.[0]) {
        // default accounts[chainId]?.[0] , if not exist, use AELF
        return (
          accounts[chainId]?.[0] || accounts[SupportedELFChainId.AELF]?.[0] || defaultNullValue
        );
      }
      return defaultNullValue;
    }
    return address || defaultNullValue;
  }, [type, network, accounts, toChainId, fromChainId, fromAddress, toAddress]);

  const handleAddressClick = useCallback(() => {
    // link to Deposit: toTransfer.chainId and Withdraw: fromTransfer.chainId
    if (network === BlockchainNetworkType.AELF) {
      openWithBlank(
        getAelfExploreLink(
          calcAddress(),
          AelfExploreType.address,
          type === 'To' ? toChainId : fromChainId,
        ),
      );
      return;
    }
    openWithBlank(
      getOtherExploreLink(
        calcAddress(),
        OtherExploreType.address,
        network as keyof typeof ExploreUrlType,
      ),
    );
  }, [network, calcAddress, type, toChainId, fromChainId]);

  return (
    <div
      className={clsx(
        styles['address-box'],
        isMobilePX ? styles['mobile-address-box'] : styles['web-address-box'],
      )}>
      <NetworkLogo network={network} />
      <CommonTooltip title={calcAddress()} trigger={'hover'}>
        <span className={clsx(styles['address-word'])} onClick={handleAddressClick}>
          {getOmittedStr(calcAddress(), 8, 9)}
        </span>
      </CommonTooltip>
      <Copy toCopy={calcAddress()} size={CopySize.Small} />
    </div>
  );
}
