import { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import Wrapper from 'containers/wrapper';
import { Media } from 'components/media-query';
import Image from 'next/image';

const Webinar: FC = () => {
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
    <section className="bg-white" id="stay-up-to-date">
      <div className="relative z-20">
        <Wrapper>
          <section ref={ref} className="relative max-h-screen bg-white">
            <Media lessThan="sm">
              <Image
                layout="responsive"
                src="/images/about/video/tractorimage.jpg"
                alt="Video tractor image"
                width={375}
                height={211}
              />
            </Media>
            <Media greaterThanOrEqual="md">
              <video ref={videoRef} src="/videos/truck.mp4" className="aspect-video" loop muted />
            </Media>
          </section>
        </Wrapper>
      </div>

      <div className="flex flex-col justify-end overflow-hidden relative z-10 aspect-[1440/580] -mt-80">
        <video src="/videos/earth.mp4" className="w-full aspect-auto" loop muted />
      </div>
    </section>
  );
};
export default Webinar;
