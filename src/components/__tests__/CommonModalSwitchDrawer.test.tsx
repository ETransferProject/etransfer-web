import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi, Mock } from 'vitest';
import CommonModalSwitchDrawer from '../CommonModalSwitchDrawer';
import { useCommonState } from 'store/Provider/hooks';

// Mock dependencies
vi.mock('store/Provider/hooks', () => ({
  useCommonState: vi.fn(() => ({ isPadPX: false })),
}));

vi.mock('components/CommonDrawer', () => ({
  default: vi.fn(({ footer }) => <div data-testid="drawer">{footer}</div>),
}));

vi.mock('components/CommonModal', () => ({
  default: vi.fn(({ children }) => <div data-testid="modal">{children}</div>),
}));

describe('CommonModalSwitchDrawer Component', () => {
  const mockProps = {
    open: true,
    onClose: vi.fn(),
    onOk: vi.fn(),
    title: 'Test Title',
    children: <div>Content</div>,
  };

  test('renders CommonModal when not in mobile view', () => {
    render(<CommonModalSwitchDrawer {...mockProps} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('renders CommonDrawer in mobile view', () => {
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });
    render(<CommonModalSwitchDrawer {...mockProps} />);
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  test('renders correct buttons in drawer footer', () => {
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });
    render(<CommonModalSwitchDrawer {...mockProps} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  test('handles button visibility flags', () => {
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });
    render(<CommonModalSwitchDrawer {...mockProps} hideCancelButton hideOkButton />);

    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  test('triggers onClose and onOk callbacks', () => {
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });
    render(<CommonModalSwitchDrawer {...mockProps} />);

    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('Confirm'));

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    expect(mockProps.onOk).toHaveBeenCalledTimes(1);
  });

  test('displays custom button texts', () => {
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });
    render(<CommonModalSwitchDrawer {...mockProps} cancelText="Abort" okText="Accept" />);

    expect(screen.getByText('Abort')).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
  });

  test('renders footer slot content', () => {
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });
    render(<CommonModalSwitchDrawer {...mockProps} footerSlot={<div>Extra Footer</div>} />);

    expect(screen.getByText('Extra Footer')).toBeInTheDocument();
  });
});
