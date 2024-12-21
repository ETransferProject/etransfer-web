type TCommonSpace = {
  className?: string;
  direction: 'vertical' | 'horizontal';
  size: number;
};

export default function CommonSpace({ className, direction, size }: TCommonSpace) {
  return (
    <div
      className={className}
      style={{
        width: direction === 'horizontal' ? size : 0,
        height: direction === 'vertical' ? size : 0,
      }}
    />
  );
}
