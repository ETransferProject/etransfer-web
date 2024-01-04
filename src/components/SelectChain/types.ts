import { IChainNameItem } from 'constants/index';

export interface CommonSelectChainProps {
  menuItems: IChainNameItem[];
  selectedItem: IChainNameItem;
  onClick: (item: IChainNameItem) => void;
}

export interface SelectChainProps {
  title: string;
  clickCallback: (item: IChainNameItem) => void;
}
