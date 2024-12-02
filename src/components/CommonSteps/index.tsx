import clsx from 'clsx';
import { Steps, StepsProps } from 'antd';
import PartialLoading from 'components/PartialLoading';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';

export interface ICommonStepsProps
  extends Omit<StepsProps, 'direction' | 'labelPlacement' | 'size' | 'items'> {
  stepItems: (Required<StepsProps>['items'][number] & { isLoading?: boolean })[];
}

export default function CommonSteps({
  className,
  stepItems,
  current = 1,
  ...props
}: ICommonStepsProps) {
  const { isPadPX } = useCommonState();

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
        isPadPX ? styles['common-steps-vertical'] : styles['common-steps-horizontal'],
        styles['common-steps'],
        className,
      )}
      direction={isPadPX ? 'vertical' : 'horizontal'}
      labelPlacement={isPadPX ? 'horizontal' : 'vertical'}
      size="small"
      items={stepItemsWithIcon}
      current={current}
    />
  );
}
