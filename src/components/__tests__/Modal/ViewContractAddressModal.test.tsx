import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ViewContractAddressModal from '../../Modal/ViewContractAddressModal';
import CommonModalTip from 'components/Tips/CommonModalTip';
import Copy from 'components/Copy';
import OpenLink from 'components/OpenLink';

// Mock dependencies
vi.mock('components/Tips/CommonModalTip', () => ({
  default: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock('components/Copy', () => ({
  default: vi.fn(() => <div>Copy</div>),
  CopySize: { Big: 'big' },
}));

vi.mock('components/OpenLink', () => ({
  default: vi.fn(() => <div>OpenLink</div>),
}));

vi.mock('constants/misc', () => ({
  GOT_IT: 'Got it',
}));

describe('ViewContractAddressModal', () => {
  const mockProps = {
    open: true,
    network: 'Ethereum',
    value: '0x123...abc',
    link: 'https://etherscan.io',
    getContainer: document.body,
    onOk: vi.fn(),
  };

  test('renders with correct props', () => {
    render(<ViewContractAddressModal {...mockProps} />);

    // Verify CommonModalTip props
    expect(CommonModalTip).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        closable: false,
        okText: 'Got it',
        className: expect.stringMatching(/viewContractAddressModal/),
        footerClassName: expect.stringMatching(/viewContractAddressModalFooter/),
        getContainer: document.body,
        onOk: mockProps.onOk,
      }),
      expect.anything(),
    );
  });

  test('displays correct content', () => {
    render(<ViewContractAddressModal {...mockProps} />);

    // Verify title
    expect(screen.getByText('Contract Address on Ethereum')).toBeInTheDocument();

    // Verify contract address
    expect(screen.getByText('0x123...abc')).toBeInTheDocument();

    // Verify Copy component
    expect(Copy).toHaveBeenCalledWith(
      expect.objectContaining({
        toCopy: '0x123...abc',
        size: 'big',
      }),
      expect.anything(),
    );

    // Verify OpenLink component
    expect(OpenLink).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'https://etherscan.io',
      }),
      expect.anything(),
    );
  });

  test('triggers onOk callback', () => {
    render(<ViewContractAddressModal {...mockProps} />);

    // Simulate ok button click
    const { onOk } = (CommonModalTip as any).mock.calls[0][0];
    onOk?.();
    expect(mockProps.onOk).toHaveBeenCalled();
  });
});
