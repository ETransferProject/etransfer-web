import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormTextarea from '../FormTextarea';

// Mock Ant Design TextArea
vi.mock('antd', () => ({
  Input: {
    TextArea: vi.fn(({ className, ...props }) => (
      <textarea data-testid="ant-textarea" className={className} {...props} />
    )),
  },
}));

describe('FormTextarea Component', () => {
  test('renders textarea with correct props', () => {
    const { container } = render(<FormTextarea autoSize={false} value="test value" />);

    // Check if the textarea has the correct props
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveValue('test value');
    expect(textarea).toHaveAttribute('spellcheck', 'false');
  });

  test('handles onChange event', () => {
    // Mock onBlur event
    const mockOnChange = vi.fn();

    render(<FormTextarea autoSize={false} onChange={mockOnChange} />);

    // Simulate onChange event
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new value' },
    });

    // Check if onChange event was called with the correct value
    expect(mockOnChange).toHaveBeenCalledWith('new value');
  });

  test('merges textareaProps correctly', () => {
    render(<FormTextarea autoSize={false} textareaProps={{ placeholder: 'Enter text' }} />);

    // Check if the placeholder is set correctly
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('handles onBlur event', () => {
    // Mock onBlur event
    const mockOnBlur = vi.fn();

    render(<FormTextarea autoSize={false} onBlur={mockOnBlur} />);

    // Simulate onBlur event
    fireEvent.blur(screen.getByRole('textbox'));

    // Check if onBlur event was called
    expect(mockOnBlur).toHaveBeenCalled();
  });
});
