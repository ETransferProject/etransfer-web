import clsx from 'clsx';
import Image, { ImageProps } from 'next/image';
import styles from './styles.module.scss';

export default function CommonImage({
  className,
  style,
  fill = true,
  alt = 'img',
  ...props
}: ImageProps) {
  return (
    <div className={clsx(styles['common-img'], className)} style={style}>
      <Image {...props} fill={fill} alt={alt} />
    </div>
  );
}
