import { ChainId } from '@portkey/types';
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
import { useAccounts } from 'hooks/portkeyWallet';
import { useCallback } from 'react';
import { addressFormat } from 'utils/aelfBase';
import { getOmittedStr } from 'utils/calculate';
import { getAelfExploreLink, getOtherExploreLink, openWithBlank } from 'utils/common';
import styles from './styles.module.scss';

interface WalletProps {
  address: string;
  chainId: ChainId;
}

const AelfChain: ChainId[] = [
  BlockchainNetworkType.AELF,
  BlockchainNetworkType.tDVV,
  BlockchainNetworkType.tDVW,
];

export default function Wallet({ address, chainId }: WalletProps) {
  const accounts = useAccounts();

  const calcAddress = useCallback(() => {
    if (address && AelfChain.includes(chainId)) {
      // aelf chain address: add prefix and suffix
      return addressFormat(address, chainId);
    }
    if (!address && AelfChain.includes(chainId)) {
      // when address is null, need accounts address
      if (accounts && accounts[chainId] && accounts[chainId]?.[0]) {
        return accounts[chainId]?.[0] || defaultNullValue;
      }
      return defaultNullValue;
    }
    return address || defaultNullValue;
  }, [address, chainId, accounts]);

  const handleAddressClick = useCallback(() => {
    if (AelfChain.includes(chainId)) {
      openWithBlank(getAelfExploreLink(calcAddress(), AelfExploreType.address, chainId));
      return;
    }
    openWithBlank(
      getOtherExploreLink(
        calcAddress(),
        OtherExploreType.address,
        chainId as keyof typeof ExploreUrlType,
      ),
    );
  }, [chainId, calcAddress]);

  return (
    <div className={clsx('flex-row-center', styles['wallet-container'])}>
      <CommonTooltip title={calcAddress()} trigger={'hover'}>
        <span className={clsx(styles['address'])} onClick={handleAddressClick}>
          {getOmittedStr(calcAddress(), 8, 9)}
        </span>
      </CommonTooltip>
      <Copy toCopy={calcAddress()} size={CopySize.Small} />
    </div>
  );
}
