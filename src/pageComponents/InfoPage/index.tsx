import { SideMenuKey } from 'constants/home';
import { useEffectOnce } from 'react-use';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import TokenDashboard from './TokenDashboard';
import TransferDashboard from './TransferDashboard';
import Space from 'components/Space';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Overview from './Overview';
import myEvents from 'utils/myEvent';
import { useCallback, useState } from 'react';

export default function InfoPage() {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();
  const [isShowDetailDrawer, setIsShowDetailDrawer] = useState(false);

  const handleShowDetail = useCallback(() => {
    setIsShowDetailDrawer(true);
  }, []);
  const handleHideDetail = useCallback(() => {
    setIsShowDetailDrawer(false);
  }, []);

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.Info));
  });

  useEffectOnce(() => {
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
      <div style={{ display: isShowDetailDrawer ? 'none' : 'block' }}>
        <Overview />
        <Space direction={'vertical'} size={isPadPX ? 40 : 64} />
        <TokenDashboard />
        <Space direction={'vertical'} size={isPadPX ? 40 : 64} />
      </div>
      <TransferDashboard />
    </div>
  );
}
