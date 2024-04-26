import clsx from 'clsx';
import { Modal } from 'antd';
import CircleLoading from 'components/CircleLoading';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { SET_GLOBAL_LOADING } from 'constants/events';
import { useCallback, useEffect, useState } from 'react';
import { eventBus } from 'utils/myEvent';

export interface LoadingProps {
  className?: string;
  width?: number;
  isHasText?: boolean;
  text?: string;
  isLoading?: boolean;
}

export default function Loading() {
  const { isMobilePX } = useCommonState();
  const defaultWidth = isMobilePX ? 240 : 360;

  const [loadingInfo, setLoadingInfo] = useState<LoadingProps>();

  const setLoadingHandler = useCallback((isLoading: boolean, loadingInfo?: LoadingProps) => {
    const isHasText = typeof loadingInfo?.isHasText === 'boolean' ? loadingInfo?.isHasText : true;
    const info = {
      ...loadingInfo,
      isHasText,
      text: isHasText ? loadingInfo?.text || 'Loading...' : '',
    };
    setLoadingInfo({
      isLoading,
      ...info,
    });
  }, []);

  useEffect(() => {
    eventBus.addListener(SET_GLOBAL_LOADING, setLoadingHandler);
    return () => {
      eventBus.removeListener(SET_GLOBAL_LOADING, setLoadingHandler);
    };
  }, [setLoadingHandler]);

  return (
    <Modal
      className={clsx(styles['loading-modal'], loadingInfo?.className)}
      width={loadingInfo?.width || defaultWidth}
      closable={false}
      keyboard={false}
      maskClosable={false}
      footer={null}
      centered
      open={loadingInfo?.isLoading}>
      <CircleLoading />
      {!!loadingInfo?.text && (
        <span className={clsx('text-center', styles['loading-modal-text'])}>
          {loadingInfo?.text}
        </span>
      )}
    </Modal>
  );
}
