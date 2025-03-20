import { useMemo, useState, useImperativeHandle, forwardRef, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { TooltipProps } from 'antd';
import CommonTooltip from 'components/CommonTooltip';
import CommonModal, { CommonModalProps } from 'components/CommonModal';
import { useCommonState } from 'store/Provider/hooks';
import { GOT_IT } from 'constants/misc';
import styles from './styles.module.scss';
import { CloseMedium } from 'assets/images';

export interface ICommonTooltipSwitchModalRef {
  open: () => void;
}

interface ICommonTooltipSwitchModalProps {
  tooltipProps?: Pick<TooltipProps, 'className'>;
  modalProps?: Pick<CommonModalProps, 'className' | 'title' | 'zIndex'>;
  modalWidth?: number;
  tip: React.ReactNode;
  children: React.ReactNode;
  modalFooterClassName?: string;
  tooltipElementId?: string;
}

const CommonTooltipSwitchModal = forwardRef<
  ICommonTooltipSwitchModalRef,
  ICommonTooltipSwitchModalProps
>(
  (
    {
      tooltipProps,
      modalProps,
      modalWidth = 335,
      tip,
      children,
      modalFooterClassName,
      tooltipElementId,
    },
    ref,
  ) => {
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

    useEffect(() => {
      if (!isPadPX) {
        handleModalClose();
      }
    }, [handleModalClose, isPadPX]);

    return (
      <>
        <CommonTooltip
          {...tooltipProps}
          placement="top"
          title={isTooltip && tip}
          getPopupContainer={() => document.getElementById(tooltipElementId || '') as HTMLElement}>
          {children}
        </CommonTooltip>
        <CommonModal
          {...modalProps}
          className={clsx(styles['common-tooltip-switch-modal'], modalProps?.className)}
          footerClassName={clsx(styles['common-tooltip-switch-modal-footer'], modalFooterClassName)}
          width={modalWidth}
          closeIcon={<CloseMedium />}
          hideCancelButton
          okText={GOT_IT}
          open={isModalOpen}
          onOk={handleModalClose}
          onCancel={handleModalClose}>
          <div>{tip}</div>
        </CommonModal>
      </>
    );
  },
);

CommonTooltipSwitchModal.displayName = 'CommonTooltipSwitchModal';

export default CommonTooltipSwitchModal;
