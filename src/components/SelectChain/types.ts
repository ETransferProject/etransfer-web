import { ChainNameItem } from 'constants/index';

export interface CommonSelectChainProps {
  menuItems: ChainNameItem[];
  selectedItem: ChainNameItem;
  onClick: (item: ChainNameItem) => void;
}

export interface SelectChainProps {
  title: string;
  clickCallback: (item: ChainNameItem) => void;
}
