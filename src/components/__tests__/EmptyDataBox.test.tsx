import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyDataBox from '../EmptyDataBox';
import styles from '../EmptyDataBox/styles.module.scss';

// Mock icon components
vi.mock('assets/images', () => ({
  EmptyBox: () => <div data-testid={'empty-box'} />,
}));

describe('EmptyDataBox', () => {
  test('renders default empty text', () => {
    render(<EmptyDataBox />);

    // Assert
    expect(screen.getByText('No found')).toBeInTheDocument();
  });

  test('displays custom empty text when provided', () => {
    render(<EmptyDataBox emptyText="Custom empty message" />);

    // Assert
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  test('has correct CSS classes', () => {
    const { container } = render(<EmptyDataBox />);

    // Check if the wrapper div has the correct class
    const wrapperDiv = container.firstChild;
    expect(wrapperDiv).toHaveClass(styles['empty-data-box']);

    // Check if the text span has the correct class
    const textSpan = screen.getByText('No found');
    expect(textSpan).toHaveClass(styles['empty-data-box-text']);
  });

  test('renders EmptyBox image component', () => {
    render(<EmptyDataBox />);

    // Check if the EmptyBox component is rendered
    expect(screen.getByTestId('empty-box')).toBeInTheDocument();
  });
});
