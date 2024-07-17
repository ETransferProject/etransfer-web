import { ToArrow } from 'assets/images';
import Space from 'components/Space';
import useGetTokenIcon from 'hooks/infoDashboard';
import TokenBox from 'pageComponents/InfoPage/TokenDashboard/ColumnComponents/TokenBox';

export interface FromToTokenProps {
  fromSymbol: string;
  fromIcon?: string;
  toSymbol: string;
  toIcon?: string;
}

export default function FromToToken({ fromSymbol, fromIcon, toSymbol, toIcon }: FromToTokenProps) {
  const getTokenIcon = useGetTokenIcon();

  const fromIconBackup = getTokenIcon(fromSymbol)?.icon || '';
  const toIconBackup = getTokenIcon(toSymbol)?.icon || '';

  return (
    <div className="flex-row-center">
      <TokenBox symbol={fromSymbol} icon={fromIcon || fromIconBackup} />
      <Space direction={'horizontal'} size={6} />
      <div className="flex-row-center flex-shrink-0" style={{ width: 14, height: 14 }}>
        <ToArrow />
      </div>
      <Space direction={'horizontal'} size={6} />
      <TokenBox symbol={toSymbol} icon={toIcon || toIconBackup} />
    </div>
  );
}
