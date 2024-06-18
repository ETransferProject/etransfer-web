import Space from 'components/Space';
import AddressBox, { TAddressBoxProps } from '../AddressBox';
import TxHashBox, { TTxHashBoxProps } from '../TxHashBox';

export default function FromAndToBox({
  type,
  fromAddress,
  toAddress,
  network,
  fromChainId,
  toChainId,
  orderStatus,
  txHashLabel,
  txHash,
}: Omit<TAddressBoxProps & TTxHashBoxProps, 'chainId'>) {
  return (
    <div>
      <AddressBox
        type={type}
        fromAddress={fromAddress}
        toAddress={toAddress}
        network={network}
        fromChainId={fromChainId}
        toChainId={toChainId}
      />
      <Space direction={'vertical'} size={2} />
      <TxHashBox
        txHashLabel={txHashLabel}
        txHash={txHash}
        orderStatus={orderStatus}
        chainId={type === 'From' ? fromChainId : toChainId}
        network={network}
      />
    </div>
  );
}
