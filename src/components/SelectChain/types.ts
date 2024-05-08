import { IChainNameItem } from 'constants/index';

type TSelectChainCommon = {
  className?: string;
  childrenClassName?: string;
  isBorder?: boolean;
  suffix?: React.ReactNode;
  hideDownArrow?: boolean;
};

export interface DeviceSelectChainProps extends TSelectChainCommon {
  menuItems: IChainNameItem[];
  selectedItem: IChainNameItem;
  onClick: (item: IChainNameItem) => void;
}

export interface SelectChainProps extends TSelectChainCommon {
  title: string;
  clickCallback: (item: IChainNameItem) => void;
}
