import { Select } from 'antd';
import { BusinessType, TokenItem } from 'types/api';
import { setCurrentSymbol } from 'store/reducers/token/slice';

import { useCommonState, useAppDispatch } from 'store/Provider/hooks';

export default function SelectToken({
  onChange,
  tokenList = [],
}: {
  onChange?: (value: string) => void;
  tokenList: TokenItem[];
}) {
  const dispatch = useAppDispatch();
  const { activeMenuKey } = useCommonState();

  const handleTokenChange = (value: string) => {
    dispatch(setCurrentSymbol({ key: activeMenuKey as unknown as BusinessType, symbol: value }));
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <Select
      style={{ width: '100%' }}
      placeholder=""
      onChange={handleTokenChange}
      options={tokenList.map((item: TokenItem) => ({
        label: item.name,
        value: item.symbol,
      }))}
    />
  );
}
