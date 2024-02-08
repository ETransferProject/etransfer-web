import { Button, ButtonProps } from 'antd';
import clsx from 'clsx';
import styles from './styles.module.scss';

export enum CommonButtonSize {
  Small = 'small',
  Middle = 'middle',
  Large = 'large',
}

export enum CommonButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
}

export type CommonButtonProps = Omit<ButtonProps, 'size' | 'type'> & {
  size?: CommonButtonSize;
  type?: CommonButtonType;
  stretched?: boolean;
};

export default function CommonButton({
  size = CommonButtonSize.Middle,
  type = CommonButtonType.Primary,
  stretched = false,
  ...props
}: CommonButtonProps) {
  return (
    <Button
      {...props}
      className={clsx(
        styles['common-button'],
        styles[size],
        styles[type],
        { [styles['stretched']]: stretched },
        props.className,
      )}
    />
  );
}
