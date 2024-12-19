import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import clsx from 'clsx';
import CommonTooltip from 'components/CommonTooltip';
import Copy, { CopySize } from 'components/Copy';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import {
  BlockchainNetworkType,
  AelfExploreType,
  OtherExploreType,
  ExploreUrlNotAelf,
} from 'constants/network';
import { useGetAelfAccount } from 'hooks/wallet/useAelf';
import { useCallback } from 'react';
import { formatDIDAddress } from 'utils/aelf/aelfBase';
import { getOmittedStr } from 'utils/calculate';
import { getAelfExploreLink, getOtherExploreLink, openWithBlank } from 'utils/common';
import styles from './styles.module.scss';
import { AelfChainIdList } from 'constants/chain';
import { COBO_CUSTODY } from 'constants/misc';

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
  const accounts = useGetAelfAccount();

  const calcAddress = useCallback(() => {
    if (chainId && network === BlockchainNetworkType.AELF) {
      if (address && AelfChainIdList.includes(chainId)) {
        // aelf chain address: add prefix and suffix
        return formatDIDAddress(address, chainId);
      }
      if (!address && AelfChainIdList.includes(chainId)) {
        // when address is null, need accounts address
        if (accounts && accounts[chainId]) {
          return accounts[chainId] || DEFAULT_NULL_VALUE;
        }
        return DEFAULT_NULL_VALUE;
      }
    }

    return address || DEFAULT_NULL_VALUE;
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
          network as keyof typeof ExploreUrlNotAelf,
        ),
      );
    },
    [chainId, network, calcAddress],
  );

  return (
    <div className={clsx('flex-row-center', styles['wallet-container'], className)}>
      {calcAddress() === COBO_CUSTODY ? (
        <span className={clsx(styles['address-cobo'])}>{COBO_CUSTODY}</span>
      ) : (
        <>
          <CommonTooltip title={calcAddress()} trigger={'hover'}>
            <span className={clsx(styles['address'])} onClick={handleAddressClick}>
              {isOmitAddress ? getOmittedStr(calcAddress(), 8, 9) : calcAddress()}
            </span>
          </CommonTooltip>
          {!!calcAddress() && calcAddress() !== DEFAULT_NULL_VALUE && (
            <Copy toCopy={calcAddress()} size={CopySize.Small} />
          )}
        </>
      )}
    </div>
  );
}
