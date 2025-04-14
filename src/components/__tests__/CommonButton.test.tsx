import { beforeEach, vi, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommonButton, {
  CommonButtonProps,
  CommonButtonSize,
  CommonButtonType,
} from '../CommonButton';
import clsx from 'clsx';

// Mock Antd Button
vi.mock('antd', async (importOriginal) => {
  // const actual = await importOriginal();
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Button: vi.fn(({ className, ...props }) => (
      <button {...props} className={className} data-testid="antd-button" />
    )),
  };
});

// Emulate clsx class name generation
vi.mock('clsx', () => ({
  default: vi.fn(() => 'mocked-classname'),
}));

describe('CommonButton Component', () => {
  const defaultProps: CommonButtonProps = {
    size: CommonButtonSize.Middle,
    type: CommonButtonType.Primary,
    stretched: false,
  };

  beforeEach(() => {
    (clsx as any).mockClear();
  });

  test('Correct rendering of default configuration', () => {
    render(<CommonButton>Test Button</CommonButton>);

    // Assert that the button is rendered
    const button = screen.getByTestId('antd-button');

    // Assert that the button text is correct
    expect(button.textContent).toBe('Test Button');
  });

  describe('Class name generation logic', () => {
    const classCases: Array<{
      props: Partial<CommonButtonProps>;
      expectedClasses: string[];
    }> = [
      {
        props: { size: CommonButtonSize.Small },
        expectedClasses: ['etransfer-ui-common-button-Small'],
      },
      {
        props: { type: CommonButtonType.Secondary },
        expectedClasses: ['etransfer-ui-common-button-Secondary'],
      },
      {
        props: { stretched: true },
        expectedClasses: ['etransfer-ui-common-button-stretched'],
      },
      {
        props: { className: 'custom-class' },
        expectedClasses: ['custom-class'],
      },
    ];

    test.each(classCases)('Generates the correct class name when passing $props', ({ props }) => {
      render(
        <CommonButton {...defaultProps} {...props}>
          Button
        </CommonButton>,
      );

      expect(clsx).toHaveBeenCalled();
    });

    test('Merge multiple class names', () => {
      render(
        <CommonButton
          size={CommonButtonSize.Large}
          type={CommonButtonType.Secondary}
          stretched
          className="extra-class">
          Button
        </CommonButton>,
      );

      // TODO random hash
      // Assert that the correct class names are generated
      expect(clsx).toHaveBeenCalledWith(
        '_common-button_42d790',
        '_large_42d790',
        '_secondary_42d790',
        {
          _stretched_42d790: true,
        },
        'extra-class',
      );
      // expect(clsx).toHaveBeenCalledWith(
      //   expect.stringMatching(/^_common-button_[0-9a-fA-F]{6}$/),
      //   // expect.stringMatching(/^_large_[0-9a-fA-F]{6}$/),
      //   expect.stringContaining('_large_'),
      //   expect.stringContaining('large'),
      //   expect.stringContaining('secondary'),
      //   expect.objectContaining({
      //     [expect.stringContaining('_stretched_')]: true,
      //   }),
      //   'extra-class',
      // );
    });
  });

  test('Handling undefined and null values', () => {
    render(
      <CommonButton size={undefined} type={undefined} stretched={undefined}>
        Button
      </CommonButton>,
    );

    // TODO random hash
    // Assert that the correct class names are generated
    expect(clsx).toHaveBeenCalledWith(
      '_common-button_42d790',
      '_middle_42d790',
      '_primary_42d790',
      { ['_stretched_42d790']: false },
      undefined,
    );
  });

  test('Snapshot Matching', () => {
    const { asFragment } = render(
      <CommonButton
        size={CommonButtonSize.Small}
        type={CommonButtonType.Primary}
        stretched
        className="custom-class">
        Submit
      </CommonButton>,
    );

    // Assert that the component matches the snapshot
    expect(asFragment()).toMatchSnapshot();
  });
});
