import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommonModalTip from '../../Tips/CommonModalTip';
import CommonModal from 'components/CommonModal';

// Mock dependencies
vi.mock('components/CommonModal', () => ({
  default: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock('../../Tips/CommonModalTip/styles.module.scss', () => ({
  default: {
    commonModalTips: 'commonModalTips',
    commonModalTipsFooter: 'commonModalTipsFooter',
  },
}));

describe('CommonModalTip Component', () => {
  const mockProps = {
    open: true,
    title: 'Test Title',
    className: 'custom-class',
    footerClassName: 'custom-footer',
    children: <div data-testid="test-content">Content</div>,
  };

  test('renders with correct props', () => {
    render(<CommonModalTip {...mockProps} />);

    // Verify CommonModal props
    expect(CommonModal).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        getContainer: 'body',
        hideCancelButton: true,
        className: expect.stringContaining('commonModalTips custom-class'),
        footerClassName: expect.stringContaining('commonModalTipsFooter custom-footer'),
        title: 'Test Title',
      }),
      expect.anything(),
    );

    // Verify content rendering
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  test('uses default getContainer prop', () => {
    render(<CommonModalTip open={true} />);

    expect(CommonModal).toHaveBeenCalledWith(
      expect.objectContaining({
        getContainer: 'body',
      }),
      expect.anything(),
    );
  });

  test('merges classNames correctly', () => {
    const { rerender } = render(<CommonModalTip open={true} />);

    // Check default classes
    let modalProps = (CommonModal as any).mock.calls[0][0];
    expect(modalProps.className).toContain('commonModalTips');
    expect(modalProps.footerClassName).toContain('commonModalTipsFooter');

    // Check with custom classes
    rerender(<CommonModalTip open={true} className="extra-class" footerClassName="extra-footer" />);
    modalProps = (CommonModal as any).mock.calls[1][0];
    expect(modalProps.className).toContain('commonModalTips extra-class');
    expect(modalProps.footerClassName).toContain('commonModalTipsFooter extra-footer');
  });

  test('forces hideCancelButton to true', () => {
    render(<CommonModalTip open={true} hideCancelButton={false} />);

    const modalProps = (CommonModal as any).mock.calls[0][0];
    expect(modalProps.hideCancelButton).toBe(true);
  });
});
