import { render, screen, act } from '@testing-library/react';
import { describe, expect, test, vi, Mock } from 'vitest';
import { useRef } from 'react';
import CommonTooltipSwitchModal from '../CommonTooltipSwitchModal';
import { useCommonState } from 'store/Provider/hooks';
import { GOT_IT } from 'constants/misc';

// Mock dependencies
vi.mock('store/Provider/hooks', () => ({
  useCommonState: vi.fn(() => ({ isPadPX: false })),
}));

vi.mock('components/CommonTooltip', () => ({
  default: vi.fn(({ children, getPopupContainer, ...props }) => {
    getPopupContainer?.();
    return (
      <div {...props} data-testid="tooltip">
        {children}
      </div>
    );
  }),
}));

vi.mock('components/CommonModal', () => ({
  default: vi.fn(({ children, ...props }) => (
    <div {...props} data-testid="modal">
      {children}
    </div>
  )),
}));

describe('CommonTooltipSwitchModal Component', () => {
  const mockTip = <div>Tooltip Content</div>;
  const mockChildren = <button>Trigger</button>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders modal in mobile view', () => {
    // Mock isPadPX to true
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });

    render(<CommonTooltipSwitchModal tip={mockTip}>{mockChildren}</CommonTooltipSwitchModal>);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  test('exposes ref open method', async () => {
    const TestComponent = () => {
      const ref = useRef<any>(null);
      return (
        <>
          <CommonTooltipSwitchModal ref={ref} tip={mockTip}>
            {mockChildren}
          </CommonTooltipSwitchModal>
          <button onClick={() => ref.current?.open()}>Open</button>
        </>
      );
    };

    render(<TestComponent />);

    act(() => {
      // Mock open modal
      screen.getByText('Open').click();
    });

    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  test('exposes ref open method with pad screen', async () => {
    // Mock isPadPX to true
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });

    const TestComponent = () => {
      const ref = useRef<any>(null);
      return (
        <>
          <CommonTooltipSwitchModal ref={ref} tip={mockTip}>
            {mockChildren}
          </CommonTooltipSwitchModal>
          <button onClick={() => ref.current?.open()}>Open</button>
        </>
      );
    };

    render(<TestComponent />);

    act(() => {
      // Mock open modal
      screen.getByText('Open').click();
    });

    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  test('passes correct props to modal', () => {
    // Mock isPadPX to true
    (useCommonState as Mock).mockReturnValueOnce({ isPadPX: true });

    render(
      <CommonTooltipSwitchModal tip={mockTip} modalWidth={400} modalProps={{ title: 'Test Title' }}>
        {mockChildren}
      </CommonTooltipSwitchModal>,
    );

    const modal = screen.getByTestId('modal');
    expect(modal).toHaveAttribute('title', 'Test Title');
    expect(modal).toHaveAttribute('oktext', GOT_IT);
  });

  test('applies custom class names', () => {
    render(
      <CommonTooltipSwitchModal
        tip={mockTip}
        tooltipProps={{ className: 'custom-tooltip' }}
        modalProps={{ className: 'custom-modal' }}
        modalFooterClassName="custom-footer">
        {mockChildren}
      </CommonTooltipSwitchModal>,
    );

    // Assert
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveClass('custom-tooltip');
  });
});
