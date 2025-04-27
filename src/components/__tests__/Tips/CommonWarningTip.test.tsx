import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommonWarningTip from '../../Tips/CommonWarningTip';

// Mock dependencies
vi.mock('assets/images', () => ({
  InfoLineIcon: () => <div data-testid="info-icon" />,
  ArrowRight: () => <div data-testid="arrow-icon" />,
}));

vi.mock('../../Tips/CommonWarningTip/styles.module.scss', () => ({
  default: {
    'common-warning-tip': 'common-warning-tip',
    'common-warning-tip-content': 'common-warning-tip-content',
  },
}));

describe('CommonWarningTip Component', () => {
  const mockProps = {
    content: 'Test warning message',
    onClick: vi.fn(),
  };

  test('renders with default props', () => {
    render(<CommonWarningTip {...mockProps} />);

    // Verify content
    expect(screen.getByText('Test warning message')).toBeInTheDocument();

    // Verify icons
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();

    // Verify default styles
    const container = screen.getByText('Test warning message').parentElement?.parentElement;
    expect(container).toHaveStyle('border-radius: 8px');
    expect(container).toHaveClass('flex-row-center');
  });

  test('hides icons when props set to false', () => {
    render(<CommonWarningTip {...mockProps} isShowPrefix={false} isShowSuffix={false} />);

    expect(screen.queryByTestId('info-icon')).toBeNull();
    expect(screen.queryByTestId('arrow-icon')).toBeNull();
  });

  test('applies custom className and borderRadius', () => {
    render(<CommonWarningTip {...mockProps} className="custom-class" borderRadius={12} />);

    const container = screen.getByText('Test warning message').parentElement?.parentElement;
    expect(container).toHaveClass('custom-class');
    expect(container).toHaveStyle('border-radius: 12px');
  });

  test('triggers onClick callback', () => {
    render(<CommonWarningTip {...mockProps} />);

    const container = screen.getByText('Test warning message').parentElement?.parentElement;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(container!);

    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  test('renders content wrapper correctly', () => {
    render(<CommonWarningTip {...mockProps} />);

    const contentWrapper = screen.getByText('Test warning message').parentElement;
    expect(contentWrapper).toHaveClass('flex-row-center');
    expect(contentWrapper).toHaveClass('flex-1');
  });
});
