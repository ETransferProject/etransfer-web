import { useRef, useEffect } from 'react';
import clsx from 'clsx';
import lottie, { AnimationItem } from 'lottie-web';
import animationData from './data.json';
import styles from './styles.module.scss';

interface CircleLoadingProps {
  className?: string;
}

export default function CircleLoading({ className }: CircleLoadingProps) {
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

  return <div className={clsx(styles['circle-loading'], className)} ref={containerRef}></div>;
}
