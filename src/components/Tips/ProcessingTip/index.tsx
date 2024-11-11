import CommonSpace from 'components/CommonSpace';
import CommonWarningTip from 'components/Tips/CommonWarningTip';

export interface ProcessingTipProps {
  depositProcessingCount?: number;
  transferProcessingCount?: number;
  marginBottom?: number;
  borderRadius?: number;
  className?: string;
  onClick: () => void;
}
export function ProcessingTip({
  depositProcessingCount,
  transferProcessingCount,
  marginBottom = 16,
  borderRadius,
  className,
  onClick,
}: ProcessingTipProps) {
  if (!transferProcessingCount && !depositProcessingCount) return null;

  let text; // TODO
  if (!transferProcessingCount && depositProcessingCount) {
    text = `${depositProcessingCount} ${
      depositProcessingCount > 1 ? 'deposits' : 'deposit'
    } processing`;
  } else if (!depositProcessingCount && transferProcessingCount) {
    text = `${transferProcessingCount} ${
      transferProcessingCount > 1 ? 'transactions' : 'transaction'
    } processing`;
  } else if (transferProcessingCount && depositProcessingCount) {
    text = `${transferProcessingCount} ${
      transferProcessingCount > 1 ? 'transactions' : 'transaction'
    } and ${depositProcessingCount} ${
      depositProcessingCount > 1 ? 'deposits' : 'deposit'
    } processing`;
  } else {
    text = '';
  }

  if (!text) return null;

  return (
    <>
      <CommonWarningTip
        content={text}
        onClick={onClick}
        className={className}
        borderRadius={borderRadius}
      />
      <CommonSpace direction="vertical" size={marginBottom} />
    </>
  );
}
