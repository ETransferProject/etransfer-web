import { SideMenuKey } from 'constants/home';
import { useEffectOnce } from 'react-use';
import { useAppDispatch, useCommonState, useInfoDashboardState } from 'store/Provider/hooks';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import TokenDashboard from './TokenDashboard';
import TransferDashboard from './TransferDashboard';
import Space from 'components/Space';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Overview from './Overview';
import myEvents from 'utils/myEvent';
import { useCallback, useMemo, useState } from 'react';
import CommonDrawer from 'components/CommonDrawer';
import TransferDetail from './TransferDetail';
// import { LocalStorageKey } from 'constants/localStorage';

export default function InfoPage() {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();
  const [isShowDetailDrawer, setIsShowDetailDrawer] = useState(false);
  const { transferList, selectedTransfer } = useInfoDashboardState();
  const currentTransferDetail = useMemo(
    () => selectedTransfer || transferList[0],
    [selectedTransfer, transferList],
  );

  const handleShowDetail = useCallback(() => {
    setIsShowDetailDrawer(true);

    if (!isPadPX) {
      // scroll to top, and show Breadcrumb
      document.querySelector('#etransferWebWrapper')?.scrollTo(0, 0);
    }
  }, [isPadPX]);
  const handleHideDetail = useCallback(() => {
    setIsShowDetailDrawer(false);
  }, []);

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.Info));
  });

  // const [hasTransferDashboard, setHasTransferDashboard] = useState(false);
  // const showTransferDashboard = useCallback(() => {
  //   const isSHowTransferDashboard = localStorage.getItem(
  //     LocalStorageKey.TRANSFER_DASHBOARD_DISPLAY,
  //   );

  //   setHasTransferDashboard(isSHowTransferDashboard === 'show');
  // }, []);

  useEffectOnce(() => {
    // showTransferDashboard();

    const { remove: removeShow } =
      myEvents.ShowWebTransferDashboardDetailPage.addListener(handleShowDetail);
    const { remove: removeHide } =
      myEvents.HideWebTransferDashboardDetailPage.addListener(handleHideDetail);

    return () => {
      removeShow();
      removeHide();
    };
  });

  return (
    <div className={clsx('wide-screen-content-container', styles['info-page'])}>
      <div style={{ display: !isPadPX && isShowDetailDrawer ? 'none' : 'block' }}>
        <Overview />
        <Space direction={'vertical'} size={isPadPX ? 40 : 64} />
        <TokenDashboard />
        <Space direction={'vertical'} size={isPadPX ? 40 : 64} />

        {/* {hasTransferDashboard && <TransferDashboard />} */}
        <TransferDashboard />
      </div>

      {!isPadPX ? (
        <div style={{ display: isShowDetailDrawer ? 'block' : 'none' }}>
          <TransferDetail {...currentTransferDetail} />
        </div>
      ) : (
        <CommonDrawer
          open={isShowDetailDrawer}
          height={'100%'}
          title={<div className={styles['detail-title']}>Transfer Detail</div>}
          id="TransferDashboardDetailMobileDrawer"
          className={styles['detail-drawer-wrapper']}
          destroyOnClose
          placement={'right'}
          onClose={() => setIsShowDetailDrawer(false)}>
          <TransferDetail {...currentTransferDetail} />
        </CommonDrawer>
      )}
    </div>
  );
}
