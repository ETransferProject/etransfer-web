import { TGetRecordDetailResult } from 'types/api';
import TransferDetailMain from '../TransferDetailMain';
import MobileSecondPageHeader from 'components/Header/MobileSecondPageHeader';

export default function MobileHistoryDetail(props: TGetRecordDetailResult) {
  return (
    <>
      <MobileSecondPageHeader title="Transfer Detail" />
      <div className={'main-content-container main-content-container-safe-area'}>
        <TransferDetailMain {...props} />
      </div>
    </>
  );
}
