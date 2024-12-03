import clsx from 'clsx';
import { Steps, StepsProps } from 'antd';
import PartialLoading from 'components/PartialLoading';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { useMemo } from 'react';

export interface ICommonStepsProps extends Omit<StepsProps, 'labelPlacement' | 'size' | 'items'> {
  stepItems: (Required<StepsProps>['items'][number] & { isLoading?: boolean })[];
}

export default function CommonSteps({
  className,
  stepItems,
  current = 1,
  direction,
  ...props
}: ICommonStepsProps) {
  const { isPadPX } = useCommonState();

  const stepDirection = useMemo(() => {
    const _default = isPadPX ? 'vertical' : 'horizontal';
    return direction || _default;
  }, [direction, isPadPX]);

  const stepDirectionClassName = useMemo(() => {
    return stepDirection === 'vertical'
      ? styles['common-steps-vertical']
      : styles['common-steps-horizontal'];
  }, [stepDirection]);

  const stepItemsWithIcon = stepItems?.map((item, index) => ({
    ...item,
    icon:
      current === index && item.isLoading ? (
        <PartialLoading className={styles['common-steps-loading']} />
      ) : undefined,
  }));

  return (
    <Steps
      {...props}
      className={clsx(
        stepDirectionClassName,
        styles['common-steps'],
        styles['common-steps-weight'],
        className,
      )}
      direction={stepDirection}
      labelPlacement={isPadPX ? 'horizontal' : 'vertical'}
      size="small"
      items={stepItemsWithIcon}
      current={current}
    />
  );
}
