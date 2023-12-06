import { ChainNameItem } from 'constants/index';

export interface CommonSelectChainProps {
  menuItems: ChainNameItem[];
  selectedItem: ChainNameItem;
  onClick: (item: ChainNameItem) => void;
}

export interface SelectChainProps {
  clickCallback: (item: ChainNameItem) => void;
}
