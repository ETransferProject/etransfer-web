import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SimpleTipModal from '../../Modal/SimpleTipModal';
import CommonModalTip from 'components/Tips/CommonModalTip';

// Mock dependencies
vi.mock('components/Tips/CommonModalTip', () => ({
  default: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock('constants/misc', () => ({
  GOT_IT: 'Got it',
}));

describe('SimpleTipModal', () => {
  const mockProps = {
    open: true,
    content: 'Test content',
    getContainer: document.body,
    onOk: vi.fn(),
  };

  test('renders with correct props', () => {
    render(<SimpleTipModal {...mockProps} />);

    // Verify CommonModalTip props
    expect(CommonModalTip).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        closable: false,
        okText: 'Got it',
        className: expect.any(String),
        footerClassName: expect.any(String),
        getContainer: document.body,
        onOk: mockProps.onOk,
      }),
      expect.anything(),
    );

    // Verify content rendering
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('passes correct className to CommonModalTip', () => {
    render(<SimpleTipModal {...mockProps} />);

    const expectedClass = expect.stringMatching(/simpleTipModal/);
    expect(CommonModalTip).toHaveBeenCalledWith(
      expect.objectContaining({
        className: expectedClass,
        footerClassName: expectedClass,
      }),
      expect.anything(),
    );
  });

  test('calls onOk when modal is confirmed', () => {
    render(<SimpleTipModal {...mockProps} />);

    // Simulate CommonModalTip's ok button click
    const { onOk } = (CommonModalTip as any).mock.calls[0][0];
    onOk?.();

    expect(mockProps.onOk).toHaveBeenCalled();
  });
});
