import { describe, test, expect, vi, beforeEach, Mock } from 'vitest';
import { render } from '@testing-library/react';
import PartialLoading from '../PartialLoading';
import lottie from 'lottie-web';

// Mock lottie-web and animation methods
vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: vi.fn(() => ({
      stop: vi.fn(),
      destroy: vi.fn(),
    })),
  },
}));

// Mock local JSON data
vi.mock('./data.json', () => ({}));

// Mock PartialLoading styles
vi.mock('../PartialLoading/styles.module.scss', () => ({
  default: {
    'partial-loading': 'partial-loading',
  },
}));

describe('PartialLoading Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('initializes lottie animation on mount', () => {
    render(<PartialLoading />);

    // Assert
    expect(lottie.loadAnimation).toHaveBeenCalled();
  });

  test('cleans up animation on unmount', () => {
    const { unmount } = render(<PartialLoading />);
    const mockAnimation = (lottie.loadAnimation as Mock).mock.results[0].value;

    unmount();

    // Assert
    expect(mockAnimation.stop).toHaveBeenCalled();
    expect(mockAnimation.destroy).toHaveBeenCalled();
  });

  test('applies correct class names', () => {
    const { container } = render(<PartialLoading className="custom-class" />);
    const div = container.firstChild;

    // Assert
    expect(div).toHaveClass('row-center');
    expect(div).toHaveClass('partial-loading');
    expect(div).toHaveClass('custom-class');
  });

  test('only initializes animation once', () => {
    const { rerender } = render(<PartialLoading />);

    // Rerender with updated props
    rerender(<PartialLoading className="updated-class" />);

    // Assert
    expect(lottie.loadAnimation).toHaveBeenCalledTimes(1);
  });
});
