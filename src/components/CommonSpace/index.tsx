type TCommonSpace = {
  direction: 'vertical' | 'horizontal';
  size: number;
};

export default function CommonSpace({ direction, size }: TCommonSpace) {
  return (
    <div
      style={{
        width: direction === 'horizontal' ? size : 0,
        height: direction === 'vertical' ? size : 0,
      }}
    />
  );
}
