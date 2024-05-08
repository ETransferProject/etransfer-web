import { QRCode } from 'react-qrcode-logo';
import { useCommonState } from 'store/Provider/hooks';

export default function CommonQRCode({
  value,
  logoUrl,
  size = 120,
}: {
  value: string;
  logoUrl?: string;
  size?: number;
}) {
  const { isMobilePX } = useCommonState();
  return (
    <QRCode
      value={value}
      size={size}
      quietZone={0}
      logoImage={logoUrl}
      logoWidth={isMobilePX ? 28 : 20}
      logoHeight={isMobilePX ? 28 : 20}
      logoPadding={isMobilePX ? 3 : 2}
      logoPaddingStyle="square"
      qrStyle={'squares'}
      eyeRadius={{ outer: 7, inner: 4 }}
      ecLevel={'M'}
    />
  );
}
