import { render } from '@testing-library/react';
import { describe, expect, test, vi, Mock } from 'vitest';
import CommonSteps from '../CommonSteps';
import { Steps } from 'antd';
import styles from '../CommonSteps/styles.module.scss';
import { useCommonState } from 'store/Provider/hooks';
import clsx from 'clsx';

// Mock the useCommonState hook
vi.mock('store/Provider/hooks', () => ({
  useCommonState: vi.fn(() => ({ isPadPX: false })),
}));

// Mock Antd Steps component for prop verification
vi.mock('antd', () => ({
  Steps: vi.fn(({ children, ...props }) => (
    <div {...props} data-testid="antd-steps">
      {children}
    </div>
  )),
}));

// Mock PartialLoading component for isLoading verification
vi.mock('../PartialLoading', () => ({
  default: vi.fn(() => <div data-testid="mock-partial-loading" />),
}));

describe('CommonSteps Component', () => {
  const mockStepItems = [
    { title: 'Step 1', isLoading: true },
    { title: 'Step 2', isLoading: false },
  ];

  test('renders with default horizontal direction', () => {
    render(<CommonSteps stepItems={mockStepItems} current={0} />);

    // Verify that the Steps component is rendered with the correct props
    expect(Steps).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'horizontal',
        labelPlacement: 'vertical',
        size: 'small',
      }),
      expect.anything(),
    );
  });

  test('respects direction prop override', () => {
    render(<CommonSteps stepItems={mockStepItems} direction="vertical" current={0} />);

    // Verify that the Steps component is rendered with the correct props
    expect(Steps).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'vertical' }),
      expect.anything(),
    );
  });

  test('adapts to mobile layout when isPadPX is true', () => {
    // Mock the useCommonState hook to return isPadPX as true
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });

    render(<CommonSteps stepItems={mockStepItems} current={0} />);

    // Verify that the Steps component is rendered with the correct props
    expect(Steps).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'vertical',
        labelPlacement: 'horizontal',
      }),
      expect.anything(),
    );
  });

  test('applies hideLine className when hideLine is true', () => {
    render(<CommonSteps stepItems={mockStepItems} current={0} hideLine />);

    // Verify that the clsx function is called with the correct arguments
    expect(clsx).toHaveBeenCalledWith(
      styles['common-steps-horizontal'],
      styles['common-steps'],
      styles['common-steps-weight'],
      styles['common-steps-hide-line'],
      undefined,
    );
  });
});
