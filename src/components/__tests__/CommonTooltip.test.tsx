import { render, screen } from '@testing-library/react';
import { vi, describe, expect, it } from 'vitest';
import CommonTooltip from '../CommonTooltip';
import { Tooltip } from 'antd';
import clsx from 'clsx';
import styles from '../CommonTooltip/styles.module.scss';

// Mock dependencies
vi.mock('antd', () => ({
  Tooltip: vi.fn(({ children }) => <div data-testid="tooltip">{children}</div>),
}));

vi.mock('clsx', () => ({
  default: vi.fn((...args) => args.join(' ')),
}));

describe('CommonTooltip', () => {
  const mockTitle = 'Test tooltip content';
  const mockClassName = 'custom-class';
  const mockChild = <button>Hover me</button>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default className', () => {
    render(<CommonTooltip title={mockTitle}>{mockChild}</CommonTooltip>);

    // Check if Tooltip was called with the correct props
    const tooltip = screen.getByTestId('tooltip');
    expect(Tooltip).toHaveBeenCalledWith(
      expect.objectContaining({
        overlayClassName: expect.stringContaining(styles['common-tooltip-overlay']),
      }),
      expect.anything(),
    );
    expect(tooltip).toContainElement(screen.getByText('Hover me'));
  });

  it('should combine custom overlayClassName with default', () => {
    render(
      <CommonTooltip title={mockTitle} overlayClassName={mockClassName}>
        {mockChild}
      </CommonTooltip>,
    );

    // Check if clsx was called with the correct arguments
    expect(clsx).toHaveBeenCalledWith(styles['common-tooltip-overlay'], mockClassName);
  });

  it('should pass through all tooltip props', () => {
    const testProps = {
      title: mockTitle,
      placement: 'bottom' as const,
      trigger: ['hover', 'click'],
    };

    render(<CommonTooltip {...testProps}>{mockChild}</CommonTooltip>);

    // Check if Tooltip was called with the correct props
    expect(Tooltip).toHaveBeenCalledWith(
      expect.objectContaining({
        ...testProps,
        overlayClassName: expect.any(String),
      }),
      expect.anything(),
    );
  });

  it('should render children correctly', () => {
    render(<CommonTooltip title={mockTitle}>{mockChild}</CommonTooltip>);

    // Check if children were rendered
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });
});
