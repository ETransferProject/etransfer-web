import { ToArrow } from 'assets/images';
import Space from 'components/Space';
import TokenBox from 'pageComponents/InfoPage/TokenDashboard/ColumnComponents/TokenBox';

export interface FromToTokenProps {
  fromSymbol: string;
  fromIcon: string;
  toSymbol: string;
  toIcon: string;
}

export default function FromToToken({ fromSymbol, fromIcon, toSymbol, toIcon }: FromToTokenProps) {
  return (
    <div>
      <TokenBox symbol={fromSymbol} icon={fromIcon} />
      <Space direction={'horizontal'} size={6} />
      <ToArrow />
      <Space direction={'horizontal'} size={6} />
      <TokenBox symbol={toSymbol} icon={toIcon} />
    </div>
  );
}
