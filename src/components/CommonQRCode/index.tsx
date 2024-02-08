import { QRCode } from 'react-qrcode-logo';
import { useCommonState } from 'store/Provider/hooks';

export default function CommonQRCode({ value, logoUrl }: { value: string; logoUrl?: string }) {
  const { isMobilePX } = useCommonState();
  return (
    <QRCode
      value={value}
      size={isMobilePX ? 164 : 120}
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
