import { render, screen } from '@testing-library/react';
import { vi, describe, expect, test, beforeEach } from 'vitest';
import CommonImage from '../CommonImage';
import Image from 'next/image';
import clsx from 'clsx';

// Mock next/image
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: vi.fn(({ alt, ...props }) => <img alt={alt} {...props} data-testid="mock-image" />),
}));

// Mock clsx
vi.mock('clsx', () => ({
  default: vi.fn(() => 'mocked-class'),
}));

describe('CommonImage Component', () => {
  const defaultProps = {
    alt: 'test-image',
    src: '/test-image.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders basic structure', () => {
    render(<CommonImage {...defaultProps} />);

    // Check if the image component is rendered
    expect(screen.getByTestId('mock-image')).toBeInTheDocument();
    expect(Image).toHaveBeenCalled();
  });

  test('applies default props', () => {
    render(<CommonImage {...defaultProps} />);

    // Check if the image props are passed correctly
    expect(Image).toHaveBeenCalledWith(
      expect.objectContaining({
        fill: true,
        alt: 'test-image',
        src: '/test-image.jpg',
      }),
      {},
    );
  });

  test('merges class names correctly', () => {
    render(<CommonImage {...defaultProps} className="custom-class" />);

    // Check if the class names are merged correctly
    expect(clsx).toHaveBeenCalledWith(expect.stringContaining('common-img'), 'custom-class');
  });

  test('passes through image props', () => {
    const customProps = {
      src: '/custom-image.png',
      alt: 'custom-alt',
      fill: false,
      width: 100,
      height: 100,
    };

    render(<CommonImage {...customProps} />);

    // Check if the image props are passed correctly
    expect(Image).toHaveBeenCalledWith(expect.objectContaining(customProps), expect.anything());
  });

  test('applies style to wrapper div', () => {
    const testStyle = { margin: '10px' };
    render(<CommonImage {...defaultProps} style={testStyle} />);

    // Check if the wrapper div has the correct style
    const wrapper = screen.getByTestId('mock-image').parentElement;
    expect(wrapper).toHaveStyle(testStyle);
  });

  test('overrides default props', () => {
    render(<CommonImage {...defaultProps} alt="custom-alt" fill={false} />);

    // Check if the image props are overridden
    expect(Image).toHaveBeenCalledWith(
      expect.objectContaining({
        alt: 'custom-alt',
        fill: false,
      }),
      expect.anything(),
    );
  });

  test('matches snapshot', () => {
    const { asFragment } = render(<CommonImage {...defaultProps} />);

    // Check if the snapshot matches the rendered component
    expect(asFragment()).toMatchSnapshot();
  });
});
