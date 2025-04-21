import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import CommonSpace from '../CommonSpace';

describe('CommonSpace Component', () => {
  test('renders with correct dimensions for horizontal direction', () => {
    const { container } = render(
      <CommonSpace direction="horizontal" size={20} className="test-class" />,
    );

    // Assert that the container has the correct class and dimensions
    const divElement = container.firstChild as HTMLElement;
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveClass('test-class');
    expect(divElement.style.width).toBe('20px');
    expect(divElement.style.height).toBe('0px');
  });

  test('renders with correct dimensions for vertical direction', () => {
    const { container } = render(<CommonSpace direction="vertical" size={30} />);

    // Assert that the height is set to 30px
    const divElement = container.firstChild as HTMLElement;
    expect(divElement.style.width).toBe('0px');
    expect(divElement.style.height).toBe('30px');
  });

  test('handles zero size value correctly', () => {
    const { container } = render(<CommonSpace direction="horizontal" size={0} />);

    // Assert that the width is set to 0
    const divElement = container.firstChild as HTMLElement;
    expect(divElement.style.width).toBe('0px');
  });

  test('applies no className when not provided', () => {
    const { container } = render(<CommonSpace direction="horizontal" size={10} />);

    // Assert that the container does not have any class
    const divElement = container.firstChild as HTMLElement;
    expect(divElement.className).toBe('');
  });
});
