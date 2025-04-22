import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, Mock } from 'vitest';
import Copy, { CopySize } from '../Copy';
import { useCopyToClipboard } from 'react-use';
import { useCommonState } from 'store/Provider/hooks';

// Mock dependencies
vi.mock('react-use', () => ({
  useCopyToClipboard: vi.fn(() => [{}, vi.fn()]),
}));

vi.mock('store/Provider/hooks', () => ({
  useCommonState: vi.fn(() => ({ isPadPX: false })),
}));

vi.mock('components/CommonTooltip', () => ({
  default: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock icon components
vi.mock('assets/images', () => ({
  Copy: () => <div data-testid={'copy-icon'} />,
  CopySmall: () => <div data-testid="copy-small-icon" />,
  CopyBig: () => <div data-testid="copy-big-icon" />,
  Check: () => <div data-testid={'check-icon'} />,
  CheckSmall: () => <div data-testid="check-small-icon" />,
  CheckBig: () => <div data-testid="check-big-icon" />,
}));

describe('Copy Component', () => {
  const mockCopyText = 'test-copy-content';
  const mockSetCopy = vi.fn();

  beforeEach(() => {
    // Mock useCopyToClipboard
    (useCopyToClipboard as Mock).mockReturnValue([null, mockSetCopy]);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test('copies text and shows check icon on click', async () => {
    render(<Copy toCopy={mockCopyText} />);

    // fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByTestId('copy-icon'));

    // Assert that the text was copied
    expect(mockSetCopy).toHaveBeenCalledWith(mockCopyText);
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  test('prevents multiple copies when already copied', () => {
    render(<Copy toCopy={mockCopyText} />);

    // First click
    fireEvent.click(screen.getByTestId('copy-icon'));
    // Second click
    fireEvent.click(screen.getByTestId('check-icon'));

    expect(mockSetCopy).toHaveBeenCalledTimes(1);
  });

  test('resets state after timeout', async () => {
    render(<Copy toCopy={mockCopyText} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('copy-icon'));
    });

    // Advance timers by 2 seconds to simulate the cool down period
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
  });

  test('resets state after timeout with pad device', async () => {
    // Mock mobile view
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });
    render(<Copy toCopy={mockCopyText} />);

    await act(async () => {
      // First click
      fireEvent.click(screen.getByTestId('copy-icon'));

      // Second click
      fireEvent.click(screen.getByTestId('copy-icon'));
    });

    // Advance timers by 2 seconds to simulate the cool down period
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
  });

  test('shows correct tooltip text', () => {
    const { rerender } = render(<Copy toCopy={mockCopyText} />);

    // Desktop view
    expect(screen.getByTitle('Copy')).toBeInTheDocument();

    // Mock mobile view
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });

    rerender(<Copy toCopy={mockCopyText} />);

    // Click to show tooltip
    fireEvent.click(screen.getByTestId('copy-icon'));
    expect(screen.getByTitle('Copied')).toBeInTheDocument();
  });

  test('renders correct icon sizes', () => {
    // Small size
    const { rerender } = render(<Copy toCopy={mockCopyText} size={CopySize.Small} />);
    expect(screen.getByTestId('copy-small-icon')).toBeInTheDocument();

    // Big size
    rerender(<Copy toCopy={mockCopyText} size={CopySize.Big} />);
    expect(screen.getByTestId('copy-big-icon')).toBeInTheDocument();

    // Normal size
    rerender(<Copy toCopy={mockCopyText} />);
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
  });

  test('handles mobile tooltip behavior', () => {
    // Mock mobile view
    (useCommonState as Mock).mockReturnValue({ isPadPX: true });

    render(<Copy toCopy={mockCopyText} />);

    // Click to show tooltip
    fireEvent.click(screen.getByTestId('copy-icon'));
    expect(screen.getByTitle('Copied')).toBeInTheDocument();
  });
});
