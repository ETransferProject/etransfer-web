/* eslint-disable jsx-a11y/alt-text */
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import DisplayImage from '../DisplayImage';
import styles from '../DisplayImage/styles.module.scss';

// Mock CommonImage component
vi.mock('components/CommonImage', () => ({
  default: ({ src, onError, ...props }: { src?: string; onError?: () => void }) => {
    if (src === 'invalid-src') {
      onError?.();
    }
    // eslint-disable-next-line @next/next/no-img-element
    return src ? <img {...props} data-testid="common-image" src={src} /> : null;
  },
}));

describe('DisplayImage Component', () => {
  const mockProps = {
    name: 'Test',
    width: 48,
    height: 48,
  };

  test('renders default initial when no src provided', () => {
    render(<DisplayImage {...mockProps} />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  test('displays image when valid src provided', () => {
    render(<DisplayImage {...mockProps} src="valid-src" />);
    expect(screen.getByTestId('common-image')).toBeInTheDocument();
  });

  test('shows default initial when image fails to load', () => {
    render(<DisplayImage {...mockProps} src="invalid-src" />);
    expect(screen.queryByTestId('common-image')).not.toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  test('applies circle style when isCircle is true', () => {
    const { container } = render(<DisplayImage {...mockProps} isCircle />);
    expect(container.firstChild).toHaveClass(styles['display-image-circle']);
  });

  test('applies correct dimensions', () => {
    const { container } = render(<DisplayImage {...mockProps} />);
    const divElement = container.firstChild as HTMLElement;
    expect(divElement.style.width).toBe('48px');
    expect(divElement.style.height).toBe('48px');
  });

  test('generates proper alt text', () => {
    render(<DisplayImage {...mockProps} src="valid-src" />);
    expect(screen.getByTestId('common-image')).toHaveAttribute('alt', 'image-Test');
  });
});
