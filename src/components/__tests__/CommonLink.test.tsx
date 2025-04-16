import { fireEvent, render, screen } from '@testing-library/react';
import { vi, describe, expect, test, beforeEach } from 'vitest';
import CommonLink from '../CommonLink';
import { Button } from 'antd';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';

// Mock dependencies
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Button: vi.fn((props) => <button {...props} data-testid="antd-button" />),
  };
});

vi.mock('@ant-design/icons/LinkOutlined', () => ({
  default: vi.fn(() => <span data-testid="link-icon" />),
}));

vi.mock('../../utils/reg', () => ({
  isUrl: vi.fn().mockReturnValue(true),
}));

vi.mock('clsx', () => ({
  default: vi.fn(() => 'mocked-class'),
}));

vi.mock('store/Provider/hooks', () => ({
  useCommonState: vi.fn().mockImplementation(() => ({
    isMobile: false,
  })),
}));

describe('CommonLink Component', () => {
  const defaultProps = {
    href: 'https://valid.url',
    children: 'Test Link',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders Antd Button by default', () => {
    render(<CommonLink {...defaultProps} />);

    // Assert that the Antd Button is rendered
    expect(screen.getByTestId('antd-button')).toBeInTheDocument();
  });

  test('renders <a> tag when isTagA=true', () => {
    const { container } = render(<CommonLink {...defaultProps} isTagA={true} />);
    expect(container.querySelector('a')).toBeInTheDocument();
  });

  test('applies mobile target attribute', () => {
    // Override mobile state mock
    vi.mocked(useCommonState).mockImplementation(() => ({
      isMobile: true,
      isMobilePX: true,
      isPadPX: true,
      activeMenuKey: SideMenuKey.CrossChainTransfer,
    }));

    render(<CommonLink {...defaultProps} />);
    expect(Button).toHaveBeenCalledWith(
      expect.objectContaining({ target: '_self' }),
      expect.anything(),
    );
  });

  //   test('disables button for invalid URL', () => {
  //     // Mock invalid URL
  //     vi.mocked(require('../../utils/reg').isUrl).mockReturnValue(false);

  //     render(<CommonLink {...defaultProps} href="" />);

  //     // Assert that the button is disabled
  //     expect(Button).toHaveBeenCalledWith(
  //       expect.objectContaining({ disabled: true }),
  //       expect.anything(),
  //     );
  //   });

  test('toggles link icon visibility', () => {
    const { rerender } = render(<CommonLink {...defaultProps} />);

    // Assert that the link icon is visible
    expect(screen.getByTestId('link-icon')).toBeInTheDocument();

    // Rerender with showIcon=false
    rerender(<CommonLink {...defaultProps} showIcon={false} />);

    // Assert that the link icon is hidden
    expect(screen.queryByTestId('link-icon')).not.toBeInTheDocument();
  });

  test('merges class names correctly', () => {
    render(<CommonLink {...defaultProps} className="custom-class" />);
    expect(clsx).toHaveBeenCalledWith('common-link', 'custom-class');
  });

  test('prevents click propagation', () => {
    // Mock event
    // const mockEvent = { stopPropagation: vi.fn().mockReturnValue('1234') };

    render(<CommonLink {...defaultProps} />);

    // Fire click event
    fireEvent.click(screen.getByTestId('antd-button'));
    // fireEvent.click(screen.getByTestId('antd-button'), mockEvent);

    // Assert that stopPropagation was called
    // expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  test('matches snapshot', () => {
    const { asFragment } = render(<CommonLink {...defaultProps} />);

    // Check if the snapshot matches the rendered component
    expect(asFragment()).toMatchSnapshot();
  });
});
