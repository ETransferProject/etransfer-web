import { render, screen } from '@testing-library/react';
import { vi, describe, expect, test, beforeEach } from 'vitest';
import CommonModal from '../CommonModal';
import { Modal } from 'antd';
import CommonButton from 'components/CommonButton';
import clsx from 'clsx';

// Mock dependencies
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Modal: vi.fn(({ children, ...props }) => (
      <div data-testid="mock-modal" {...props}>
        {children}
      </div>
    )),
  };
});

vi.mock('components/CommonButton', async (importOriginal) => {
  const actual = await importOriginal<typeof import('components/CommonButton')>();
  return {
    ...actual,
    default: vi.fn((props) => <button {...props} data-testid="common-button" />),
  };
});

vi.mock('clsx', () => ({
  default: vi.fn(() => 'mocked-class'),
}));

describe('CommonModal Component', () => {
  const defaultProps = {
    open: true,
    onCancel: vi.fn(),
    onOk: vi.fn(),
    children: <div data-testid="modal-content" />,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with default props', () => {
    render(<CommonModal {...defaultProps} />);

    // Check if the Modal component is rendered
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(Modal).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 480,
        centered: true,
        zIndex: 299,
        title: ' ',
      }),
      expect.anything(),
    );
  });

  test('renders custom footer buttons', () => {
    render(<CommonModal {...defaultProps} />);

    // Check if the two buttons are rendered
    const buttons = screen.getAllByTestId('common-button');
    expect(buttons.length).toBe(2);
    expect(buttons[0]).toHaveTextContent('Cancel');
    expect(buttons[1]).toHaveTextContent('Confirm');
  });

  test('hides footer buttons conditionally', () => {
    const { rerender } = render(<CommonModal {...defaultProps} hideCancelButton hideOkButton />);
    // Assert that the buttons are not rendered
    expect(screen.queryByTestId('common-button')).not.toBeInTheDocument();

    // Rerender with hideCancelButton=true
    rerender(<CommonModal {...defaultProps} hideCancelButton />);
    // Assert that the cancel button is not rendered
    expect(screen.getAllByTestId('common-button').length).toBe(1);
  });

  test('handles custom button texts', () => {
    render(<CommonModal {...defaultProps} cancelText="Abort" okText="Proceed" />);

    // Check if the button texts are correct
    const buttons = screen.getAllByTestId('common-button');
    expect(buttons[0]).toHaveTextContent('Abort');
    expect(buttons[1]).toHaveTextContent('Proceed');
  });

  test('disables ok button', () => {
    render(<CommonModal {...defaultProps} isOkButtonDisabled />);

    // Check if the ok button is disabled
    screen.getAllByTestId('common-button')[1];
    expect(CommonButton).toHaveBeenCalledWith(
      expect.objectContaining({ disabled: true }),
      expect.anything(),
    );
  });

  test('merges class names correctly', () => {
    render(
      <CommonModal {...defaultProps} className="custom-modal" footerClassName="custom-footer" />,
    );

    // Check if the class names are merged correctly
    expect(clsx).toHaveBeenCalledWith(expect.stringContaining('common-modal'), 'custom-modal');
    expect(clsx).toHaveBeenCalledWith(
      'flex-row-center',
      expect.stringContaining('footer'),
      'custom-footer',
    );
  });

  test('renders footer slot', () => {
    render(<CommonModal {...defaultProps} footerSlot={<div data-testid="custom-footer" />} />);

    // Check if the custom footer slot is rendered
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  test('handles custom width', () => {
    render(<CommonModal {...defaultProps} width={600} />);

    // Check if the custom width is passed correctly
    expect(Modal).toHaveBeenCalledWith(expect.objectContaining({ width: 600 }), expect.anything());
  });

  test('matches snapshot', () => {
    const { asFragment } = render(<CommonModal {...defaultProps} />);

    // Check if the snapshot matches the rendered component
    expect(asFragment()).toMatchSnapshot();
  });
});
