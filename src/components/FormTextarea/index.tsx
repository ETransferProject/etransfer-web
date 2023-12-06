import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { FocusEventHandler } from 'react';

const { TextArea } = Input;

interface FormTextareaProps {
  textareaProps?: Omit<TextAreaProps, 'value' | 'onChange'>;
  value?: string;
  onChange?: (value: string | null) => void;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
}

export default function FormTextarea({
  textareaProps,
  value,
  onChange,
  onBlur,
}: FormTextareaProps) {
  return (
    <div className={clsx('flex-row-start', styles['textarea-wrapper'])}>
      <TextArea
        spellCheck={false}
        autoSize
        {...textareaProps}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        bordered={false}
        onBlur={onBlur}
      />
    </div>
  );
}
