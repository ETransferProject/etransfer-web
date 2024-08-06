import { useCallback, useState } from 'react';
import { QuestionMarkIcon } from 'assets/images';
import { useCommonState } from 'store/Provider/hooks';
import CommonModalTips from 'components/CommonModalTips';

export default function RemainingTip({ title, content }: { title: string; content: string }) {
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
      {isPadPX && <QuestionMarkIcon onClick={handleView} />}

      <CommonModalTips
        getContainer="body"
        title={title}
        open={openModal}
        closable={false}
        okText="OK"
        onOk={handleOk}>
        <div className="text-center">{content}</div>
      </CommonModalTips>
    </>
  );
}
