import { useCallback, useEffect, useMemo } from 'react';
import useAelf from './useAelf';
import useEVM from './useEVM';
import useSolana from './useSolana';
import useTON from './useTON';
import useTRON from './useTRON';
import { IWallet, WalletTypeEnum } from 'context/Wallet/types';
import { AuthTokenSource } from 'types/api';
import { TOrderRecordsNoticeRequestAddressItem } from '@etransfer/socket';
import { useAppDispatch, useCrossChainTransfer } from 'store/Provider/hooks';
import { removeOneLocalJWT } from 'api/utils';
import { setFromWalletType, setToWalletType } from 'store/reducers/crossChainTransfer/slice';
import myEvents from 'utils/myEvent';
import { isAelfChain, isEVMChain, isSolanaChain, isTONChain, isTRONChain } from 'utils/wallet';

export function useCheckHasConnectedWallet() {
  const { isConnected: isAelfConnected } = useAelf();
  const { isConnected: isEVMConnected } = useEVM();
  const { isConnected: isSolanaConnected } = useSolana();
  const { isConnected: isTONConnected } = useTON();
  const { isConnected: isTRONConnected } = useTRON();

  return useMemo(() => {
    const hasConnectedTypeList = [];
    if (isAelfConnected) hasConnectedTypeList.push(WalletTypeEnum.AELF);
    if (isEVMConnected) hasConnectedTypeList.push(WalletTypeEnum.EVM);
    if (isSolanaConnected) hasConnectedTypeList.push(WalletTypeEnum.SOL);
    if (isTONConnected) hasConnectedTypeList.push(WalletTypeEnum.TON);
    if (isTRONConnected) hasConnectedTypeList.push(WalletTypeEnum.TRON);

    return {
      hasConnectedTypes: hasConnectedTypeList,
      hasConnected:
        isAelfConnected || isEVMConnected || isSolanaConnected || isTONConnected || isTRONConnected,
    };
  }, [isAelfConnected, isEVMConnected, isSolanaConnected, isTONConnected, isTRONConnected]);
}

export function useGetAllConnectedWalletAccount() {
  const { isConnected: isAelfConnected, account: aelfAccount } = useAelf();
  const { isConnected: isEVMConnected, account: evmAccount } = useEVM();
  const { isConnected: isSolanaConnected, account: solanaAccount } = useSolana();
  const { isConnected: isTONConnected, account: tonAccount } = useTON();
  const { isConnected: isTRONConnected, account: tronAccount } = useTRON();

  useEffect(() => {
    myEvents.HistoryActive.emit();
  }, [aelfAccount, evmAccount, solanaAccount, tonAccount, tronAccount]);

  useEffect(() => {
    myEvents.LoginSuccess.emit();
  }, [aelfAccount]);

  return useCallback(() => {
    const accountList: string[] = [];
    const accountListWithWalletType: TOrderRecordsNoticeRequestAddressItem[] = [];
    if (isAelfConnected && aelfAccount) {
      accountList.push(aelfAccount);
      accountListWithWalletType.push({
        SourceType: AuthTokenSource.Portkey.toLocaleLowerCase(),
        Address: aelfAccount,
      });
    }
    if (isEVMConnected && evmAccount) {
      accountList.push(evmAccount);
      accountListWithWalletType.push({
        SourceType: AuthTokenSource.EVM.toLocaleLowerCase(),
        Address: evmAccount,
      });
    }
    if (isSolanaConnected && solanaAccount) {
      accountList.push(solanaAccount);
      accountListWithWalletType.push({
        SourceType: AuthTokenSource.Solana.toLocaleLowerCase(),
        Address: solanaAccount,
      });
    }
    if (isTONConnected && tonAccount) {
      accountList.push(tonAccount);
      accountListWithWalletType.push({
        SourceType: AuthTokenSource.TON.toLocaleLowerCase(),
        Address: tonAccount,
      });
    }
    if (isTRONConnected && tronAccount) {
      accountList.push(tronAccount);
      accountListWithWalletType.push({
        SourceType: AuthTokenSource.TRON.toLocaleLowerCase(),
        Address: tronAccount,
      });
    }
    return {
      accountList,
      accountListWithWalletType,
    };
  }, [
    aelfAccount,
    evmAccount,
    isAelfConnected,
    isEVMConnected,
    isSolanaConnected,
    isTONConnected,
    isTRONConnected,
    solanaAccount,
    tonAccount,
    tronAccount,
  ]);
}

export function useAfterDisconnect() {
  const dispatch = useAppDispatch();
  const { fromWalletType, toWalletType } = useCrossChainTransfer();

  return useCallback(
    (account: string, walletType: WalletTypeEnum) => {
      // clear jwt
      const localKey = account + walletType;
      removeOneLocalJWT(localKey);

      // unbind wallet
      if (fromWalletType === walletType) {
        dispatch(setFromWalletType(undefined));
      }
      if (toWalletType === walletType) {
        dispatch(setToWalletType(undefined));
      }
    },
    [dispatch, fromWalletType, toWalletType],
  );
}

export function useGetOneWallet(network: string): IWallet | undefined {
  const evmWallet = useEVM();
  const solanaWallet = useSolana();
  const tonWallet = useTON();
  const tronWallet = useTRON();
  const aelfWallet = useAelf();

  if (isEVMChain(network)) return evmWallet;
  if (isSolanaChain(network)) return solanaWallet;
  if (isTONChain(network)) return tonWallet;
  if (isTRONChain(network)) return tronWallet;
  if (isAelfChain(network)) return aelfWallet;

  return undefined;
}
