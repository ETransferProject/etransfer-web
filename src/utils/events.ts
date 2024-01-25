import { LoadingProps } from 'components/Loading';
import { SET_GLOBAL_LOADING } from 'constants/events';
import { eventBus } from './myEvent';

export const emitLoading = (loading: boolean, loadingInfo?: LoadingProps) =>
  eventBus.emit(SET_GLOBAL_LOADING, loading, loadingInfo);
