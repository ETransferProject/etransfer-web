import { Input, InputProps } from 'antd';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { useCommonState } from 'store/Provider/hooks';

interface FormInputProps extends InputProps {
  unit?: string;
  maxButtonConfig?: {
    onClick: () => void;
  };
}

export default function FormAmountInput({ unit, maxButtonConfig, ...props }: FormInputProps) {
  const { isPadPX } = useCommonState();
  return (
    <div
      id="inputAmountWrapper"
      className={clsx('flex-row-center', styles['input-amount-wrapper'])}>
      <Input {...props} className={styles['input-amount']} bordered={false} />
      <div className={clsx('flex-none', 'flex-row-center', styles['input-amount-addon-after'])}>
        {maxButtonConfig && (
          <div
            className={clsx('cursor-pointer', isPadPX && styles['max-mobile'], styles['max'])}
            onClick={maxButtonConfig.onClick}>
            Max
          </div>
        )}
        {maxButtonConfig && unit && <div className={styles['dividing-line']}></div>}
        {unit && (
          <div className={clsx(styles['unit'], isPadPX && styles['unit-mobile'])}>{unit}</div>
        )}
      </div>
    </div>
  );
}
