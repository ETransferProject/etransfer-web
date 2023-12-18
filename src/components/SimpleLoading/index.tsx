import { useRef, useEffect } from 'react';
import clsx from 'clsx';
import lottie, { AnimationItem } from 'lottie-web';
import animationData from './data.json';
import styles from './styles.module.scss';

interface SimpleLoadingProps {
  className?: string;
}

export default function SimpleLoading({ className }: SimpleLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animation = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!animation.current) {
      animation.current = lottie.loadAnimation({
        container: containerRef.current as HTMLDivElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
      });
    }
    return () => {
      if (animation.current) {
        animation.current.stop();
        animation.current.destroy();
        animation.current = null;
      }
    };
  }, []);

  return (
    <div
      className={clsx('row-center', styles['simple-loading'], className)}
      ref={containerRef}></div>
  );
}
