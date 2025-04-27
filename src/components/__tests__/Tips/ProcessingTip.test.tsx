import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessingTip } from '../../Tips/ProcessingTip';

// Mock dependencies
vi.mock('components/Tips/CommonWarningTip', () => ({
  default: vi.fn(({ content, ...props }) => <div {...props}>{content}</div>),
}));
vi.mock('components/CommonSpace', () => ({
  default: vi.fn(() => <div>CommonSpace</div>),
}));

describe('ProcessingTip Component', () => {
  const mockProps = {
    onClick: vi.fn(),
  };

  test('returns null when no processing counts', () => {
    const { container } = render(<ProcessingTip {...mockProps} />);

    // Assert that the container is empty
    expect(container.firstChild).toBeNull();
  });

  test('renders deposit text correctly', () => {
    const { rerender } = render(<ProcessingTip depositProcessingCount={1} {...mockProps} />);
    expect(screen.getByText('1 deposit processing')).toBeInTheDocument();

    // Rerender with depositProcessingCount
    rerender(<ProcessingTip depositProcessingCount={2} {...mockProps} />);
    expect(screen.getByText('2 deposits processing')).toBeInTheDocument();
  });

  test('renders transfer text correctly', () => {
    const { rerender } = render(<ProcessingTip transferProcessingCount={1} {...mockProps} />);
    expect(screen.getByText('1 transfer processing')).toBeInTheDocument();

    // Rerender with transferProcessingCount
    rerender(<ProcessingTip transferProcessingCount={2} {...mockProps} />);
    expect(screen.getByText('2 transfers processing')).toBeInTheDocument();
  });

  test('renders combined text correctly', () => {
    render(<ProcessingTip depositProcessingCount={1} transferProcessingCount={2} {...mockProps} />);

    // Assert
    expect(screen.getByText('2 transfers and 1 deposit processing')).toBeInTheDocument();
  });

  test('renders combined text correctly', () => {
    render(<ProcessingTip depositProcessingCount={3} transferProcessingCount={2} {...mockProps} />);

    // Assert
    expect(screen.getByText('2 transfers and 3 deposits processing')).toBeInTheDocument();
  });

  test('renders combined text correctly', () => {
    render(<ProcessingTip depositProcessingCount={3} transferProcessingCount={1} {...mockProps} />);

    // Assert
    expect(screen.getByText('1 transfer and 3 deposits processing')).toBeInTheDocument();
  });

  test('passes correct props to CommonWarningTip and CommonSpace', () => {
    render(
      <ProcessingTip
        depositProcessingCount={3}
        marginBottom={20}
        borderRadius={8}
        className="test-class"
        {...mockProps}
      />,
    );

    // Verify CommonWarningTip props
    const warningTip = screen.getByText('3 deposits processing');
    expect(warningTip).toHaveClass('test-class');
    expect(warningTip).toHaveAttribute('borderRadius', '8');

    // Verify CommonSpace props
    expect(screen.getByText('CommonSpace')).toBeInTheDocument();
  });

  test('handles edge cases', () => {
    const { container } = render(
      <ProcessingTip depositProcessingCount={0} transferProcessingCount={0} {...mockProps} />,
    );
    expect(container.firstChild).toBeNull();

    render(
      <ProcessingTip
        depositProcessingCount={undefined}
        transferProcessingCount={5}
        {...mockProps}
      />,
    );
    expect(screen.getByText('5 transfers processing')).toBeInTheDocument();
  });
});
