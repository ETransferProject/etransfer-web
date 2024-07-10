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

export default function InfoPage() {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.Info));
  });

  return (
    <div className={clsx('wide-screen-content-container', styles['info-page'])}>
      <Overview />
      <Space direction={'vertical'} size={isPadPX ? 40 : 64} />
      <TokenDashboard />
      <Space direction={'vertical'} size={isPadPX ? 40 : 64} />
      <TransferDashboard />
    </div>
  );
}
