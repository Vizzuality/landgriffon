import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

import { Media } from 'components/media-query';

const Video: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (videoRef.current && inView) {
      videoRef.current.play();
    }

    if (videoRef.current && !inView) {
      videoRef.current.pause();
    }
  }, [inView]);

  return (
    <section ref={ref} className="relative max-h-screen bg-white">
      <Media lessThan="sm">
        <video ref={videoRef} src="/videos/truck.mp4" className="aspect-video" />
      </Media>
      <Media greaterThanOrEqual="md">
        <video ref={videoRef} src="/videos/truck.mp4" className="aspect-video" loop muted />
      </Media>
    </section>
  );
};

export default Video;
