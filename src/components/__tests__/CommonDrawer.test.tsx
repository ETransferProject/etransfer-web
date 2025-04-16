import { render, screen } from '@testing-library/react';
import { vi, describe, expect, test, beforeEach } from 'vitest';
import CommonDrawer from '../CommonDrawer';
import { Drawer } from 'antd';
import clsx from 'clsx';

// Mock Antd Drawer
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Drawer: vi.fn((props) => <div data-testid="mock-drawer" {...props} />),
  };
});

// Mock clsx
vi.mock('clsx', () => ({
  default: vi.fn(() => 'mocked-class'),
}));

describe('CommonDrawer Component', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with default props', () => {
    render(<CommonDrawer {...defaultProps} />);

    // Check if the Drawer component is rendered
    const drawer = screen.getByTestId('mock-drawer');
    expect(drawer).toBeInTheDocument();
    expect(Drawer).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: 'bottom',
        width: '100%',
        height: '88%',
        zIndex: 300,
        destroyOnClose: true,
        closable: true,
      }),
      expect.anything(),
    );
  });

  test('merges class names correctly', () => {
    render(<CommonDrawer {...defaultProps} className="custom-class" />);

    // Check if the class names are merged correctly
    expect(clsx).toHaveBeenCalledWith(expect.stringMatching(/common-drawer/), 'custom-class');
  });

  test('passes custom props to antd Drawer', () => {
    const customProps = {
      width: '50%',
      height: '50%',
      zIndex: 500,
      placement: 'right' as const,
    };

    render(<CommonDrawer {...defaultProps} {...customProps} />);

    // Check if the custom props are passed correctly
    expect(Drawer).toHaveBeenCalledWith(expect.objectContaining(customProps), expect.anything());
  });

  test('uses default values when props not provided', () => {
    render(<CommonDrawer {...defaultProps} width={undefined} height={undefined} />);

    // Check if the default values are used
    expect(Drawer).toHaveBeenCalledWith(
      expect.objectContaining({
        width: '100%',
        height: '88%',
      }),
      expect.anything(),
    );
  });

  test('matches snapshot', () => {
    const { asFragment } = render(<CommonDrawer {...defaultProps} />);

    // Check if the snapshot matches the rendered component
    expect(asFragment()).toMatchSnapshot();
  });
});
