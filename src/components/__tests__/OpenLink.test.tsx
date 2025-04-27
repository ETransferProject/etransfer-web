import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OpenLink from '../OpenLink';
import { openWithBlank } from 'utils/common';

// Mock dependencies
vi.mock('utils/common', () => ({
  openWithBlank: vi.fn(),
}));

vi.mock('assets/images', () => ({
  OpenLinkIcon: () => <div data-testid="open-link-icon" />,
}));

describe('OpenLink Component', () => {
  const mockProps = {
    href: 'https://example.com',
    className: 'custom-class',
  };

  test('renders with correct props', () => {
    render(<OpenLink {...mockProps} />);

    // Assert that the wrapper has the correct class
    const wrapper = screen.getByTestId('open-link-icon').parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  test('calls openWithBlank on click', () => {
    render(<OpenLink {...mockProps} />);

    // Click the OpenLink component
    const element = screen.getByTestId('open-link-icon').parentElement;
    if (element) {
      fireEvent.click(element);
      expect(openWithBlank).toHaveBeenCalledWith('https://example.com');
    }
  });

  test('updates href in click handler', () => {
    const { rerender } = render(<OpenLink href="https://first.com" />);

    const element1 = screen.getByTestId('open-link-icon').parentElement;
    if (element1) {
      fireEvent.click(element1);
      expect(openWithBlank).toHaveBeenCalledWith('https://first.com');
    }

    // Rerender with updated href
    rerender(<OpenLink href="https://updated.com" />);
    const element2 = screen.getByTestId('open-link-icon').parentElement;
    if (element2) {
      fireEvent.click(element2);
      expect(openWithBlank).toHaveBeenCalledWith('https://updated.com');
    }
  });

  test('renders OpenLinkIcon component', () => {
    render(<OpenLink {...mockProps} />);

    // Assert that the OpenLinkIcon component is rendered
    expect(screen.getByTestId('open-link-icon')).toBeInTheDocument();
  });
});
