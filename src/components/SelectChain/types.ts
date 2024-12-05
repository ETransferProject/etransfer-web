// import { TDynamicArrowSize } from 'components/DynamicArrow';
import { IChainNameItem } from 'constants/index';

type TSelectChainCommon = {
  selectedItem: IChainNameItem;
  className?: string;
  childrenClassName?: string;
};

export interface DeviceSelectChainProps extends TSelectChainCommon {
  isExpand: boolean;
  onClick: () => Promise<void> | void;
}

export interface SelectChainProps extends TSelectChainCommon {
  menuItems: IChainNameItem[];
  clickCallback: (item: IChainNameItem) => void;
}
