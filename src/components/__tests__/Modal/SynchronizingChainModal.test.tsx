import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SynchronizingChainModal from '../../Modal/SynchronizingChainModal';
import CommonModalTip from 'components/Tips/CommonModalTip';
import styles from '../../Modal/SynchronizingChainModal/styles.module.scss';

// Mock dependencies
vi.mock('components/Tips/CommonModalTip', () => ({
  default: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock('constants/misc', () => ({
  GOT_IT: 'Got it',
  TIPS: 'Important Tips',
}));

describe('SynchronizingChainModal', () => {
  const mockProps = {
    open: true,
    onOk: vi.fn(),
    onCancel: vi.fn(),
  };

  const expectedContent =
    'Data is synchronising on the blockchain. Please wait a minute and try again.';

  test('renders with correct props', () => {
    render(<SynchronizingChainModal {...mockProps} />);

    // Verify CommonModalTip props
    expect(CommonModalTip).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        closable: true,
        title: 'Important Tips',
        okText: 'Got it',
        getContainer: 'body',
        className: expect.stringMatching(/synchronizingChainModal/),
        footerClassName: expect.stringMatching(/synchronizingChainModalFooter/),
        onOk: mockProps.onOk,
        onCancel: mockProps.onCancel,
      }),
      expect.anything(),
    );

    // Verify content rendering
    expect(screen.getByText(expectedContent)).toBeInTheDocument();
  });

  test('triggers onOk and onCancel callbacks', () => {
    render(<SynchronizingChainModal {...mockProps} />);

    // Simulate ok click
    const { onOk } = (CommonModalTip as any).mock.calls[0][0];
    onOk?.();
    expect(mockProps.onOk).toHaveBeenCalled();

    // Simulate cancel click
    const { onCancel } = (CommonModalTip as any).mock.calls[0][0];
    onCancel?.();
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  test('renders correct static content', () => {
    render(<SynchronizingChainModal {...mockProps} />);

    // Verify body class
    expect(screen.getByText(expectedContent)).toHaveClass(styles['synchronizingChainModalBody']);
  });
});
