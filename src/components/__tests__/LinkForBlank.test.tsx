import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LinkForBlank from '../LinkForBlank';

describe('LinkForBlank', () => {
  test('renders external link with _blank target', () => {
    const { container } = render(
      <LinkForBlank href="https://example.com" element={<span>External</span>} />,
    );

    const link = container.querySelector('a');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders internal link with _self target', () => {
    const { container } = render(<LinkForBlank href="/internal" element={<span>Internal</span>} />);

    const link = container.querySelector('a');
    expect(link).toHaveAttribute('target', '_self');
  });

  test('passes className and aria-label correctly', () => {
    render(
      <LinkForBlank
        href="/test"
        className="custom-class"
        ariaLabel="Test label"
        element={<span>Test</span>}
      />,
    );

    const link = screen.getByLabelText('Test label');
    expect(link).toHaveClass('custom-class');
  });

  test('renders child element correctly', () => {
    render(<LinkForBlank href="/test" element={<span data-testid="child">Test</span>} />);

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('includes noopener noreferrer for external links', () => {
    const { container } = render(
      <LinkForBlank href="https://example.com" element={<span>Link</span>} />,
    );

    expect(container.querySelector('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
