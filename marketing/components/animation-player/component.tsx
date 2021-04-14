import React, { useEffect, useRef } from 'react';
import lottie, { AnimationConfigWithData } from 'lottie-web';

type AnimationPlayerProps = Partial<AnimationConfigWithData> & {
  children?: JSX.Element | JSX.Element[];
  className?: string;
  isAnimating?: boolean;
};

const animationSettings: Partial<AnimationConfigWithData> = {
  loop: true,
  renderer: 'svg',
};

const AnimationPlayer: React.FC<AnimationPlayerProps> = (props: Partial<AnimationPlayerProps>) => {
  const elementRef = useRef(null);
  const { className, ...restProps } = props;

  useEffect(() => {
    let playerInstance;

    if (elementRef) {
      playerInstance = lottie.loadAnimation({
        ...animationSettings,
        ...restProps,
        autoplay: true, // force autoplay
        container: elementRef.current,
      });
    }

    return () => {
      if (playerInstance) {
        playerInstance.stop();
        playerInstance.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef]);

  return (
    <div ref={elementRef} className={className} />
  );
};

export default AnimationPlayer;
