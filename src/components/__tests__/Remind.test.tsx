import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Remind, { RemindType } from '../Remind';

// Mock dependencies
vi.mock('../Remind/styles.module.scss', () => ({
  default: {
    'remind-card': 'remind-card',
    'remind-text': 'remind-text',
    'remind-border': 'remind-border',
    'remind-brand': 'remind-brand',
    'remind-info': 'remind-info',
    'remind-warning': 'remind-warning',
    icon: 'icon',
    text: 'text',
  },
}));

vi.mock('assets/images', () => ({
  InfoBrandIcon: () => <div data-testid="info-brand-icon" />,
}));

describe('Remind Component', () => {
  test('renders with default props', () => {
    render(<Remind>Test Content</Remind>);

    // Check container classes
    const container = screen.getByText('Test Content').parentElement;
    expect(container).toHaveClass('remind-card');
    expect(container).toHaveClass('remind-border');
    expect(container).toHaveClass('remind-brand');

    // Check icon
    expect(screen.getByTestId('info-brand-icon')).toBeInTheDocument();
  });

  test('renders different types', () => {
    const { rerender } = render(<Remind type={RemindType.INFO}>Info</Remind>);
    expect(screen.getByText('Info').parentElement).toHaveClass('remind-info');

    rerender(<Remind type={RemindType.WARNING}>Warning</Remind>);
    expect(screen.getByText('Warning').parentElement).toHaveClass('remind-warning');
  });

  test('hides icon when isShowIcon=false', () => {
    render(<Remind isShowIcon={false}>No Icon</Remind>);
    expect(screen.queryByTestId('info-brand-icon')).toBeNull();
  });

  test('renders text variant when isCard=false', () => {
    render(<Remind isCard={false}>Text Version</Remind>);
    expect(screen.getByText('Text Version').parentElement).toHaveClass('remind-text');
  });

  test('disables border when isBorder=false', () => {
    render(<Remind isBorder={false}>No Border</Remind>);
    expect(screen.getByText('No Border').parentElement).not.toHaveClass('remind-border');
  });

  test('renders children content', () => {
    render(
      <Remind>
        <span data-testid="child">Child</span>
      </Remind>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
