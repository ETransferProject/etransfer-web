import { QRCode } from 'react-qrcode-logo';

export default function CommonQRCode({
  value,
  logoUrl,
  size = 120,
  logoSize = 26,
  logoPadding = 3,
}: {
  value: string;
  logoUrl?: string;
  size?: number;
  logoSize?: number;
  logoPadding?: number;
}) {
  return (
    <QRCode
      value={value}
      size={size}
      quietZone={0}
      logoImage={logoUrl}
      logoWidth={logoSize}
      logoHeight={logoSize}
      logoPadding={logoPadding}
      logoPaddingStyle="square"
      qrStyle={'squares'}
      eyeRadius={{ outer: 7, inner: 4 }}
      ecLevel={'M'}
    />
  );
}
