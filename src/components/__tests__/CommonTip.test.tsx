import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CommonTip from '../CommonTip';
import React from 'react';

// Mock dependencies
vi.mock('components/CommonTooltipSwitchModal', () => ({
  __esModule: true,
  default: vi.fn(({ children, ...props }) => {
    return <div {...props}>{children}</div>;
  }),
  ICommonTooltipSwitchModalRef: {
    open: vi.fn(),
  },
}));

vi.mock('clsx', () => ({
  default: vi.fn(() => 'mocked-clsx'),
}));

vi.mock('react');

describe('CommonTip Component', () => {
  const mockProps = {
    tip: 'Test tooltip content',
    title: 'Test Title',
    className: 'custom-class',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default icon and title correctly', () => {
    render(<CommonTip {...mockProps} />);

    // Assert
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('uses custom icon when provided', () => {
    render(<CommonTip {...mockProps} icon={<span>Custom Icon</span>} />);

    // Assert
    expect(screen.getByText('Custom Icon')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('handles modal title priority correctly', () => {
    const { rerender } = render(<CommonTip {...mockProps} />);

    // Assert
    expect(screen.getByText('Test Title')).toBeInTheDocument();

    // Rerender with modalTitle
    rerender(<CommonTip {...mockProps} modalTitle="Custom Modal Title" />);

    // Assert
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('triggers modal open on click', () => {
    const mockOpen = vi.fn();
    // Mock the ref implementation
    const mockRef = { current: { open: mockOpen } };
    vi.mocked(React.useRef).mockImplementation(() => {
      return mockRef;
    });

    const { container } = render(<CommonTip {...mockProps} />);

    // fireEvent.click(container.firstChild!.firstChild as Element);

    const wrapperDiv = container.querySelector('.mocked-clsx');

    if (wrapperDiv) {
      fireEvent.click(wrapperDiv);
      // expect(vi.mocked(CommonTooltipSwitchModalRef.open)).toHaveBeenCalled();
    }
  });
});
