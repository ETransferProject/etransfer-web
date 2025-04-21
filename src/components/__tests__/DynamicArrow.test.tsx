import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import DynamicArrow, { TDynamicArrowSize } from '../DynamicArrow';
import clsx from 'clsx';
import styles from '../DynamicArrow/styles.module.scss';

// Mock icon components
vi.mock('assets/images', () => ({
  DownBigIcon: () => <div data-testid={'down-big-icon'} />,
  DownIcon: () => <div data-testid="down-normal-icon" />,
  DownSmallIcon: () => <div data-testid="down-small-icon" />,
}));

describe('DynamicArrow Component', () => {
  const testCases: TDynamicArrowSize[] = ['Big', 'Normal', 'Small'];

  test.each(testCases)('renders correct icon for %s size', (size) => {
    render(<DynamicArrow size={size} />);

    const expectedTestId = `down-${size.toLowerCase()}-icon`;
    expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
  });

  test('applies rotation when expanded and normal size', () => {
    render(<DynamicArrow isExpand />);

    expect(clsx).toHaveBeenCalledWith(
      'flex-center',
      styles['dynamic-arrow'],
      {
        [styles['dynamic-arrow-big']]: false,
        [styles['dynamic-arrow-small']]: false,
      },
      undefined,
    );
  });

  test('applies rotation when expanded and big size', () => {
    render(<DynamicArrow isExpand size="Big" />);

    expect(clsx).toHaveBeenCalledWith(
      'flex-center',
      styles['dynamic-arrow'],
      {
        [styles['dynamic-arrow-big']]: true,
        [styles['dynamic-arrow-small']]: false,
      },
      undefined,
    );
  });

  test('applies rotation when expanded and small size', () => {
    render(<DynamicArrow isExpand size="Small" />);

    expect(clsx).toHaveBeenCalledWith(
      'flex-center',
      styles['dynamic-arrow'],
      {
        [styles['dynamic-arrow-big']]: false,
        [styles['dynamic-arrow-small']]: true,
      },
      undefined,
    );
  });

  //   test('applies rotation when expanded and normal size', () => {
  //     const { container, rerender } = render(<DynamicArrow isExpand={true} />);

  //     const svg = container.querySelector('svg');
  //     // Assert that the SVG has the correct class
  //     expect(svg).toHaveClass('etransfer-ui-dynamic-arrow-icon-rotate');

  //     rerender(<DynamicArrow isExpand={false} />);
  //     // Assert that the SVG does not have the class
  //     expect(svg).not.toHaveClass('etransfer-ui-dynamic-arrow-icon-rotate');
  //   });

  test('applies custom class names', () => {
    const { container } = render(
      <DynamicArrow className="custom-wrapper" iconClassName="custom-icon" />,
    );

    const wrapper = container.firstChild;
    // const icon = screen.getByTestId('down-normal-icons');

    expect(wrapper).toHaveClass('custom-wrapper');
    // expect(icon).toHaveClass('custom-icon');
  });

  test('uses default size and expand state', () => {
    render(<DynamicArrow />);

    expect(screen.getByTestId('down-normal-icon')).toBeInTheDocument();
    expect(screen.getByTestId('down-normal-icon')).not.toHaveClass('dynamic-arrow-icon-rotate');
  });

  //   test('applies size-specific wrapper classes', () => {
  //     const { container } = render(<DynamicArrow size="Big" />);
  //     const wrapper = container.firstChild;

  //     expect(wrapper).toHaveClass('dynamic-arrow-big');
  //     expect(wrapper).not.toHaveClass('dynamic-arrow-small');
  //   });
});
