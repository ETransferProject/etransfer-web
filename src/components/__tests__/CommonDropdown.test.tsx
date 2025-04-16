import { render, screen, act } from '@testing-library/react';
import { vi, describe, expect, test, beforeEach } from 'vitest';
import CommonDropdown from '../CommonDropdown';
import { Dropdown } from 'antd';
import DynamicArrow from 'components/DynamicArrow';
import clsx from 'clsx';

// Mock dependencies
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Dropdown: vi.fn(({ children, ...props }) => (
      <div data-testid="mock-dropdown" {...props}>
        {children}
      </div>
    )),
    Menu: vi.fn(() => <div data-testid="mock-menu" />),
  };
});

vi.mock('components/DynamicArrow', () => ({
  default: vi.fn(({ isExpand }) => <div data-testid="mock-arrow">{isExpand ? '↑' : '↓'}</div>),
}));

vi.mock('clsx', () => ({
  default: vi.fn(() => 'mocked-class'),
}));

describe('CommonDropdown Component', () => {
  const defaultProps = {
    children: <button data-testid="trigger">Trigger</button>,
    handleMenuClick: vi.fn(),
    menu: {
      items: [{ key: '1', label: 'Item 1' }],
    },
  };
  const mockHandleClick = vi.fn();
  const mockGetContainer = 'test-container';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders basic structure', () => {
    render(<CommonDropdown {...defaultProps} />);

    // Assert that the Dropdown component is rendered
    expect(screen.getByTestId('mock-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    expect(screen.getByTestId('mock-arrow')).toHaveTextContent('↓');
  });

  test('renders with default props', () => {
    render(
      <CommonDropdown getContainer={mockGetContainer}>
        <div data-testid="trigger" />
      </CommonDropdown>,
    );

    // Get the getPopupContainer handler from the Dropdown component
    const menuGetPopupContainerHandler = (Dropdown as any).mock.lastCall[0].getPopupContainer;
    // Call the getPopupContainer handler
    menuGetPopupContainerHandler?.();

    // Assert that the Dropdown component is called with the correct props
    expect(Dropdown).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: ['click'],
        getPopupContainer: expect.any(Function),
      }),
      expect.anything(),
    );
  });

  test('handles menu click correctly', () => {
    render(
      <CommonDropdown getContainer={mockGetContainer} handleMenuClick={mockHandleClick}>
        <div data-testid="trigger" />
      </CommonDropdown>,
    );

    // Simulate menu click
    const menuClickHandler = (Dropdown as any).mock.calls[0][0].menu.onClick;
    // Call the menu click handler
    menuClickHandler({ key: 'test' });

    // Assert that the handleMenuClick function is called with the correct argument
    expect(mockHandleClick).toHaveBeenCalledWith({ key: 'test' });
  });

  test('toggles dropdown state', () => {
    render(
      <CommonDropdown getContainer={mockGetContainer}>
        <div data-testid="trigger" />
      </CommonDropdown>,
    );

    // Simulate onOpenChange click
    const onOpenChange = (Dropdown as any).mock.calls[0][0].onOpenChange;
    // Call the onOpenChange handler
    act(() => {
      onOpenChange(true);
    });

    // Assert that the DynamicArrow component is called with the correct props
    expect(DynamicArrow).toHaveBeenCalledWith(expect.objectContaining({ isExpand: true }), {});
  });

  test('applies correct class names', () => {
    render(<CommonDropdown {...defaultProps} isBorder={false} childrenClassName="custom-class" />);

    // Check if the class names are merged correctly
    expect(clsx).toHaveBeenCalledWith(
      'cursor-pointer',
      'flex-row-center',
      expect.stringContaining('children-container'),
      false, // isBorder condition
      'custom-class',
    );
  });

  test('hides arrow when hideDownArrow=true', () => {
    const { rerender } = render(<CommonDropdown {...defaultProps} />);

    // Assert that the arrow is visible
    expect(screen.queryByTestId('mock-arrow')).toBeInTheDocument();

    // Rerender with hideDownArrow=true
    rerender(<CommonDropdown {...defaultProps} hideDownArrow={true} />);

    // Assert that the arrow is hidden
    expect(screen.queryByTestId('mock-arrow')).not.toBeInTheDocument();
  });

  test('uses getPopupContainer correctly', () => {
    // Create a test container
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    render(<CommonDropdown {...defaultProps} getContainer="test-container" />);

    // Assert that the Dropdown component is called with the correct props
    expect(Dropdown).toHaveBeenCalledWith(
      expect.objectContaining({
        getPopupContainer: expect.any(Function),
      }),
      expect.anything(),
    );
  });

  test('passes suffixArrowSize to DynamicArrow', () => {
    render(<CommonDropdown {...defaultProps} suffixArrowSize="Small" />);

    // Assert that the DynamicArrow component is called with the correct props
    expect(DynamicArrow).toHaveBeenCalledWith(
      expect.objectContaining({
        size: 'Small',
      }),
      expect.anything(),
    );
  });

  test('matches snapshot', () => {
    const { asFragment } = render(<CommonDropdown {...defaultProps} />);

    // Check if the snapshot matches the rendered component
    expect(asFragment()).toMatchSnapshot();
  });
});
