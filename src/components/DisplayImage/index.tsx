import styles from './styles.module.scss';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import CommonImage from 'components/CommonImage';

interface DisplayImageProps {
  name: string;

  src?: string;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  isCircle?: boolean;
}

export default function DisplayImage({
  name,
  src,
  className,
  width = 24,
  height = 24,
  alt,
  isCircle = true,
}: DisplayImageProps) {
  const [showIcon, setShowIcon] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!isSuccess) {
      setShowIcon(true);
    }
  }, [isSuccess]);

  return (
    <div
      className={clsx(
        styles['display-image'],
        isCircle && styles['display-image-circle'],
        className,
      )}
      style={{ width, height }}>
      {showIcon && isSuccess && src && (
        <CommonImage
          loading="eager"
          src={src}
          alt={alt || `image-${name}`}
          width={width}
          height={height}
          fill={false}
          onLoad={() => {
            setIsSuccess(true);
          }}
          onError={() => setShowIcon(false)}
        />
      )}
      <div
        className={clsx('row-center', 'flex-shrink-0', styles['default-text'])}
        style={{ width, height, lineHeight: height }}>
        {name?.charAt(0)}
      </div>
    </div>
  );
}
