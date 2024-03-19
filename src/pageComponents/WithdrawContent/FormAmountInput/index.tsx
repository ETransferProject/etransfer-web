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
  const { isMobilePX } = useCommonState();
  return (
    <div
      id="inputAmountWrapper"
      className={clsx('flex-row-center', styles['input-amount-wrapper'])}>
      <Input {...props} className={styles['input-amount']} bordered={false} />
      <div className={clsx('flex-none', 'flex-row-center', styles['input-amount-addon-after'])}>
        {maxButtonConfig && (
          <div
            className={clsx('cursor-pointer', isMobilePX && styles['max-mobile'], styles['max'])}
            onClick={maxButtonConfig.onClick}>
            Max
          </div>
        )}
        {maxButtonConfig && unit && <div className={styles['dividing-line']}></div>}
        {unit && (
          <div className={clsx(styles['unit'], isMobilePX && styles['unit-mobile'])}>{unit}</div>
        )}
      </div>
    </div>
  );
}
