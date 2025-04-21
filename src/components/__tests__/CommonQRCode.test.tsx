import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import CommonQRCode from '../CommonQRCode';
import { QRCode } from 'react-qrcode-logo';

// Mock the QRCode component
vi.mock('react-qrcode-logo', () => ({
  QRCode: vi.fn(() => null),
}));

describe('CommonQRCode Component', () => {
  const mockValue = 'https://example.com';
  const mockLogo = 'logo.png';

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders with default props', () => {
    render(<CommonQRCode value={mockValue} />);

    expect(QRCode).toHaveBeenCalledWith(
      expect.objectContaining({
        ecLevel: 'M',
        eyeRadius: { inner: 4, outer: 7 },
        logoHeight: 26,
        logoImage: undefined,
        logoPadding: 3,
        logoPaddingStyle: 'square',
        logoWidth: 26,
        qrStyle: 'squares',
        quietZone: 0,
        size: 120,
        value: 'https://example.com',
      }),
      expect.anything(),
    );
  });

  test('renders with custom props', () => {
    render(
      <CommonQRCode
        value={mockValue}
        logoUrl={mockLogo}
        size={150}
        logoSize={30}
        logoPadding={5}
      />,
    );

    expect(QRCode).toHaveBeenCalledWith(
      expect.objectContaining({
        value: mockValue,
        logoImage: mockLogo,
        size: 150,
        logoWidth: 30,
        logoHeight: 30,
        logoPadding: 5,
        ecLevel: 'M',
      }),
      expect.anything(),
    );
  });

  test('renders without logo when logoUrl is not provided', () => {
    render(<CommonQRCode value={mockValue} />);

    expect(QRCode).toHaveBeenCalledWith(
      expect.not.objectContaining({
        logoImage: expect.anything(),
      }),
      expect.anything(),
    );
  });

  test('uses default error correction level when not provided', () => {
    render(<CommonQRCode value={mockValue} />);

    expect(QRCode).toHaveBeenCalledWith(
      expect.objectContaining({
        ecLevel: 'M',
      }),
      expect.anything(),
    );
  });
});
