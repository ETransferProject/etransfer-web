import { Input, InputProps } from 'antd';
import clsx from 'clsx';
import styles from './styles.module.scss';

interface FormInputProps extends InputProps {
  unit?: string;
  maxButtonConfig?: {
    onClick: () => void;
  };
}

export default function FormAmountInput({ unit, maxButtonConfig, ...props }: FormInputProps) {
  return (
    <div className={clsx('flex-row-center', styles['input-amount-wrapper'])}>
      <Input {...props} className={styles['input-amount']} bordered={false} />
      <div className={clsx('flex-none', 'flex-row-center', styles['input-amount-addon-after'])}>
        {unit && <div className={styles['unit']}>{unit}</div>}
        {maxButtonConfig && (
          <div className={clsx('cursor-pointer', styles['max'])} onClick={maxButtonConfig.onClick}>
            Max
          </div>
        )}
      </div>
    </div>
  );
}
