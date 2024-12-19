import { ApplicationChainStatusEnum, TMyApplicationItem } from 'types/api';

export const getApplicationDisplayInfo = (data: TMyApplicationItem) => {
  const chainTokenInfo = data?.otherChainTokenInfo?.chainId
    ? data?.otherChainTokenInfo
    : data?.chainTokenInfo?.[0];
  if (!chainTokenInfo) {
    return {
      chainTokenInfo: undefined,
      failTime: 0,
      failReason: '',
    };
  }
  const getFailResult = () => {
    switch (chainTokenInfo.status) {
      case ApplicationChainStatusEnum.Rejected:
        return {
          time: data.rejectedTime,
          reason: data.rejectedReason,
        };
      case ApplicationChainStatusEnum.Failed:
        return {
          time: data.failedTime,
          reason: data.failedReason,
        };
      default:
        return {
          time: 0,
          reason: '',
        };
    }
  };

  return {
    chainTokenInfo,
    failTime: getFailResult().time,
    failReason: getFailResult().reason,
  };
};
