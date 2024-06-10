import { FC } from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import Wrapper from 'containers/wrapper';
import Image from 'next/image';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';

const Video: FC = () => {
  const videoRef = useRef<HTMLVideoElement>();
  const { ref, inView } = useInView();

  const onVideoEnded = useCallback(() => {
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, []);

  useEffect(() => {
    if (videoRef.current && !inView) {
      videoRef.current.pause();
    }

    if (videoRef.current) {
      videoRef.current.addEventListener('ended', onVideoEnded);
    }
  }, [inView, onVideoEnded]);

  return (
    <section className="relative z-10 bg-white">
      <Wrapper>
        <motion.div
          className="relative py-12 md:py-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <div className="space-y-10">
            <h1 className="text-5xl font-black text-black uppercase font-display md:text-7xl">
              ESG Compliance with LandGriffon
            </h1>
          </div>
        </motion.div>
      </Wrapper>
      <div className="relative z-20">
        <Wrapper>
          <section ref={ref} className="relative max-h-screen bg-white">
            <YouTube
              videoId="Bzvdwt-EuNM"
              title="Landgriffon: Sustainable Supply Chain Solutions"
              className="w-full h-[320px] md:h-[418px] lg:h-[583px]"
              iframeClassName="w-full h-[320px] md:h-[418px] lg:h-[583px]"
            />
          </section>
        </Wrapper>
      </div>
      <div className="flex flex-col justify-end overflow-hidden relative z-10  md:-mt-80 -mt-72 h-80 md:h-[420px] lg:h-[696px]">
        <Image
          alt="field"
          src="/images/compliance/hero_1.jpg"
          layout="fill"
          objectPosition="top"
          className="object-cover"
          draggable={false}
        />
      </div>
    </section>
  );
};
export default Video;
