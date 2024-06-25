import { useCallback, useState } from 'react';
import { QuestionMarkIcon } from 'assets/images';
import clsx from 'clsx';
import styles from '../styles.module.scss';
import { useCommonState } from 'store/Provider/hooks';
import CommonModalTips from 'components/CommonModalTips';

export default function RemainingQuota({ content }: { content: string }) {
  const { isPadPX } = useCommonState();
  const [openModal, setOpenModal] = useState(false);

  const handleView = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleOk = useCallback(() => {
    setOpenModal(false);
  }, []);

  return (
    <>
      {isPadPX && (
        <QuestionMarkIcon onClick={handleView} className={clsx(styles['question-mark'])} />
      )}

      <CommonModalTips
        getContainer="body"
        title="24-Hour Limit"
        open={openModal}
        closable={false}
        okText="OK"
        onOk={handleOk}>
        <div className="text-center">{content}</div>
      </CommonModalTips>
    </>
  );
}
