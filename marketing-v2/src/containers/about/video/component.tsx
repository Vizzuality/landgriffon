import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

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
      <video ref={videoRef} src="/videos/truck.mp4" className="aspect-video" loop muted />
    </section>
  );
};

export default Video;
