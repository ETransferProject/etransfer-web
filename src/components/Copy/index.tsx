import { useMemo, useState, useRef } from 'react';
import { useCopyToClipboard } from 'react-use';
import clsx from 'clsx';
import { Copy as CopyNormal, CopySmall, Check as CheckNormal, CheckSmall } from 'assets/images';
import styles from './styles.module.scss';
import CommonTooltip from 'components/CommonTooltip';
import { useCommonState } from 'store/Provider/hooks';

export enum CopySize {
  Small = 'small',
  Normal = 'normal',
}

export default function Copy({
  toCopy,
  children,
  className,
  size = CopySize.Normal,
}: {
  toCopy: string;
  children?: React.ReactNode;
  className?: string;
  size?: CopySize;
}) {
  const { isMobilePX } = useCommonState();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCopyValue] = useCopyToClipboard();
  const [isShowCopyIcon, setIsShowCopyIcon] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const CopyIcon = useMemo(() => (size === CopySize.Small ? CopySmall : CopyNormal), [size]);
  const CheckIcon = useMemo(() => (size === CopySize.Small ? CheckSmall : CheckNormal), [size]);

  const tooltipTitle = useMemo(() => {
    if (isShowCopyIcon || isMobilePX) {
      return 'Copied';
    } else if (!isMobilePX) {
      return 'Copy';
    }
    return '';
  }, [isShowCopyIcon, isMobilePX]);

  return (
    <CommonTooltip
      title={tooltipTitle}
      trigger={isMobilePX ? '' : 'hover'}
      open={isMobilePX ? isTooltipOpen : undefined}>
      <span
        onClick={() => {
          if (isShowCopyIcon) {
            return;
          }
          setCopyValue(toCopy);
          setIsShowCopyIcon(true);
          if (isMobilePX) {
            setIsTooltipOpen(true);
          }
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          timerRef.current = setTimeout(() => {
            if (isMobilePX) {
              setIsTooltipOpen(false);
            }
            setIsShowCopyIcon(false);
          }, 2000);
        }}
        className={clsx(
          'flex-center',
          'cursor-pointer',
          styles['copy-icon-wrapper'],
          styles['copy-icon-wrapper-background-color'],
          styles[`copy-icon-wrapper-${size}`],
          className,
        )}>
        {isShowCopyIcon ? <CheckIcon /> : <CopyIcon />}
        {children}
      </span>
    </CommonTooltip>
  );
}
