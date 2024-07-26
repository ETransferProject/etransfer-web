import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import clsx from 'clsx';
import CommonTooltip from 'components/CommonTooltip';
import Copy, { CopySize } from 'components/Copy';
import { defaultNullValue } from 'constants/index';
import {
  BlockchainNetworkType,
  AelfExploreType,
  OtherExploreType,
  ExploreUrlType,
} from 'constants/network';
import { useGetAccount } from 'hooks/wallet';
import { useCallback } from 'react';
import { addressFormat } from 'utils/aelf/aelfBase';
import { getOmittedStr } from 'utils/calculate';
import { getAelfExploreLink, getOtherExploreLink, openWithBlank } from 'utils/common';
import styles from './styles.module.scss';
import { AelfChainIdList } from 'constants/chain';

interface WalletAddressProps {
  address: string;
  network: string;
  chainId?: TChainId;
  isOmitAddress?: boolean;
  className?: string;
}

export default function WalletAddress({
  address,
  network,
  chainId,
  isOmitAddress = true,
  className,
}: WalletAddressProps) {
  const accounts = useGetAccount();

  const calcAddress = useCallback(() => {
    if (chainId && network === BlockchainNetworkType.AELF) {
      if (address && AelfChainIdList.includes(chainId)) {
        // aelf chain address: add prefix and suffix
        return addressFormat(address, chainId);
      }
      if (!address && AelfChainIdList.includes(chainId)) {
        // when address is null, need accounts address
        if (accounts && accounts[chainId]) {
          return accounts[chainId] || defaultNullValue;
        }
        return defaultNullValue;
      }
    }

    return address || defaultNullValue;
  }, [chainId, network, address, accounts]);

  const handleAddressClick = useCallback(
    (event: any) => {
      event.stopPropagation();
      if (chainId && network === BlockchainNetworkType.AELF && AelfChainIdList.includes(chainId)) {
        openWithBlank(getAelfExploreLink(calcAddress(), AelfExploreType.address, chainId));
        return;
      }

      openWithBlank(
        getOtherExploreLink(
          calcAddress(),
          OtherExploreType.address,
          network as keyof typeof ExploreUrlType,
        ),
      );
    },
    [chainId, network, calcAddress],
  );

  return (
    <div className={clsx('flex-row-center', styles['wallet-container'], className)}>
      <CommonTooltip title={calcAddress()} trigger={'hover'}>
        <span className={clsx(styles['address'])} onClick={handleAddressClick}>
          {isOmitAddress ? getOmittedStr(calcAddress(), 8, 9) : calcAddress()}
        </span>
      </CommonTooltip>
      <Copy toCopy={calcAddress()} size={CopySize.Small} />
    </div>
  );
}
