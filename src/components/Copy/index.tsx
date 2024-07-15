import { useMemo, useState, useRef } from 'react';
import { useCopyToClipboard } from 'react-use';
import clsx from 'clsx';
import {
  Copy as CopyNormal,
  CopySmall,
  CopyBig,
  Check as CheckNormal,
  CheckSmall,
  CheckBig,
} from 'assets/images';
import styles from './styles.module.scss';
import CommonTooltip from 'components/CommonTooltip';
import { useCommonState } from 'store/Provider/hooks';

export enum CopySize {
  Small = 'small',
  Normal = 'normal',
  Big = 'big',
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
  const { isPadPX } = useCommonState();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCopyValue] = useCopyToClipboard();
  const [isShowCopyIcon, setIsShowCopyIcon] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const CopyIcon = useMemo(
    () => (size === CopySize.Small ? CopySmall : size === CopySize.Big ? CopyBig : CopyNormal),
    [size],
  );
  const CheckIcon = useMemo(
    () => (size === CopySize.Small ? CheckSmall : size === CopySize.Big ? CheckBig : CheckNormal),
    [size],
  );

  const tooltipTitle = useMemo(() => {
    if (isShowCopyIcon || isPadPX) {
      return 'Copied';
    } else if (!isPadPX) {
      return 'Copy';
    }
    return '';
  }, [isPadPX, isShowCopyIcon]);

  return (
    <CommonTooltip
      title={tooltipTitle}
      trigger={isPadPX ? '' : 'hover'}
      open={isPadPX ? isTooltipOpen : undefined}>
      <span
        onClick={() => {
          if (isShowCopyIcon) {
            return;
          }
          setCopyValue(toCopy);
          setIsShowCopyIcon(true);
          if (isPadPX) {
            setIsTooltipOpen(true);
          }
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          timerRef.current = setTimeout(() => {
            if (isPadPX) {
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
