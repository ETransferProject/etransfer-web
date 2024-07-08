import { useCommonState } from 'store/Provider/hooks';
import MobileTransfer from './MobileTransfer';
import WebTransfer from './WebTransfer';

export default function TransferDashboard() {
  const { isPadPX } = useCommonState();
  return isPadPX ? (
    <MobileTransfer />
  ) : (
    <WebTransfer
      filterFromTokenList={[]}
      filterFromChainList={[]}
      filterToTokenList={[]}
      filterToChainList={[]}
      totalCount={0}
      maxResultCount={0}
      skipCount={0}
      tableOnChange={function (page: number, pageSize: number): void {
        throw new Error('Function not implemented.');
      }}
    />
  );
}
