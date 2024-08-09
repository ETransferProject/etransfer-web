import { QuestionMarkIcon } from 'assets/images';
import clsx from 'clsx';
import styles from './styles.module.scss';
import CommonTooltip from 'components/CommonTooltip';
import Space from 'components/Space';
import { WithdrawTonCommentTip } from 'constants/withdraw';
import { useCommonState } from 'store/Provider/hooks';
import RemainingTip from '../RemainingTip';

export default function CommentFormItemLabel() {
  const { isPadPX } = useCommonState();

  return (
    <div className={clsx('flex-row-center')}>
      <span className={styles['form-label']}>Comment</span>
      <Space direction={'horizontal'} size={4} />
      {isPadPX ? (
        <RemainingTip title="Please confirm the Memo/Tag" content={WithdrawTonCommentTip} />
      ) : (
        <CommonTooltip
          className={clsx(styles['question-label'])}
          placement="top"
          title={WithdrawTonCommentTip}>
          <QuestionMarkIcon />
        </CommonTooltip>
      )}
    </div>
  );
}
