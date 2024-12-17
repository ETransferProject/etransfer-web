import { useMemo, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import clsx from 'clsx';
import { TooltipProps } from 'antd';
import CommonTooltip from 'components/CommonTooltip';
import CommonModal, { CommonModalProps } from 'components/CommonModal';
import { useCommonState } from 'store/Provider/hooks';
import { GOT_IT } from 'constants/misc';
import styles from './styles.module.scss';

export interface ICommonTooltipSwitchModalRef {
  open: () => void;
}

interface ICommonTooltipSwitchModalProps {
  tooltipProps?: Pick<TooltipProps, 'className'>;
  modalProps?: Pick<CommonModalProps, 'className' | 'title'>;
  tip: string;
  children: React.ReactNode;
}

const CommonTooltipSwitchModal = forwardRef<
  ICommonTooltipSwitchModalRef,
  ICommonTooltipSwitchModalProps
>(({ tooltipProps, modalProps, tip, children }, ref) => {
  const { isPadPX } = useCommonState();

  const isTooltip = useMemo(() => !isPadPX, [isPadPX]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = useCallback(() => {
    if (!isTooltip) {
      setIsModalOpen(true);
    }
  }, [isTooltip]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useImperativeHandle(ref, () => ({
    open: handleModalOpen,
  }));

  return (
    <>
      <CommonTooltip {...tooltipProps} placement="top" title={isTooltip && tip}>
        {children}
      </CommonTooltip>
      <CommonModal
        {...modalProps}
        className={clsx(styles['common-tooltip-switch-modal'], modalProps?.className)}
        width={'300px'}
        hideCancelButton
        okText={GOT_IT}
        open={isModalOpen}
        onOk={handleModalClose}
        onCancel={handleModalClose}>
        <div>{tip}</div>
      </CommonModal>
    </>
  );
});

CommonTooltipSwitchModal.displayName = 'CommonTooltipSwitchModal';

export default CommonTooltipSwitchModal;
