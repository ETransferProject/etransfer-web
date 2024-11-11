import styles from './styles.module.scss';
import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import {
  AelfExploreType,
  BlockchainNetworkType,
  ExploreUrlNotAelf,
  OtherExploreType,
} from 'constants/network';
import { SupportedChainId, DEFAULT_NULL_VALUE } from 'constants/index';
import Copy, { CopySize } from 'components/Copy';
import { getOmittedStr } from 'utils/calculate';
import { openWithBlank, getAelfExploreLink, getOtherExploreLink } from 'utils/common';
import { formatDIDAddress } from 'utils/aelf/aelfBase';
import { SupportedELFChainId } from 'constants/index';
import CommonTooltip from 'components/CommonTooltip';
import { useCommonState } from 'store/Provider/hooks';
import { useGetAccount } from 'hooks/wallet/useAelf';
import NetworkLogo from 'components/NetworkLogo';
import { COBO_CUSTODY } from 'constants/misc';

export type TAddressBoxProps = {
  type: 'To' | 'From';
  fromAddress: string;
  toAddress: string;
  network: string;
  fromChainId: SupportedELFChainId;
  toChainId: SupportedELFChainId;
};

export default function AddressBox({
  type,
  fromAddress,
  toAddress,
  network,
  fromChainId,
  toChainId,
}: TAddressBoxProps) {
  const { isPadPX } = useCommonState();
  const accounts = useGetAccount();
  const chainId = useMemo(() => {
    return type === 'To' ? toChainId : fromChainId;
  }, [fromChainId, toChainId, type]);

  const calcAddress = useCallback(() => {
    const address = type === 'To' ? toAddress : fromAddress;
    if (address && network === BlockchainNetworkType.AELF) {
      // format address: add suffix
      return formatDIDAddress(address, chainId || SupportedChainId.sideChain);
    }
    if (!address && network === BlockchainNetworkType.AELF) {
      // when fromAddress and toAddress all null, need accounts default address
      const currentChainId = chainId || SupportedChainId.sideChain;
      if (accounts && accounts[currentChainId]) {
        // default accounts[currentChainId]?.[0] , if not exist, use AELF
        return accounts[currentChainId] || accounts[SupportedELFChainId.AELF] || DEFAULT_NULL_VALUE;
      }
      return DEFAULT_NULL_VALUE;
    }
    return address || DEFAULT_NULL_VALUE;
  }, [type, toAddress, fromAddress, network, chainId, accounts]);

  const handleAddressClick = useCallback(
    (event: any) => {
      event.stopPropagation();
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
          network as keyof typeof ExploreUrlNotAelf,
        ),
      );
    },
    [network, calcAddress, type, toChainId, fromChainId],
  );

  return (
    <div
      className={clsx(
        styles['address-box'],
        isPadPX ? styles['mobile-address-box'] : styles['web-address-box'],
      )}>
      <NetworkLogo
        network={network === BlockchainNetworkType.AELF ? chainId : network}
        size="small"
      />
      {calcAddress() === COBO_CUSTODY ? (
        <span className={clsx(styles['address-word-static'])}>{calcAddress()}</span>
      ) : (
        <>
          <CommonTooltip title={calcAddress()} trigger={'hover'}>
            <span className={clsx(styles['address-word'])} onClick={handleAddressClick}>
              {getOmittedStr(calcAddress(), 8, 9)}
            </span>
          </CommonTooltip>
          <Copy toCopy={calcAddress()} size={CopySize.Small} />
        </>
      )}
    </div>
  );
}
