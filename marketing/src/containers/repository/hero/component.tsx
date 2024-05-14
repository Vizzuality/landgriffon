import { PauseIcon, PlayIcon } from '@heroicons/react/solid';
import Wrapper from 'containers/wrapper';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from 'components/icon';
import DOWNLOAD_SVG from 'svgs/ui/icn_download.svg?sprite';

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>();
  const [playing, setPlaying] = useState(false);

  const onTogglePlay = useCallback(() => {
    if (videoRef.current) {
      if (!playing) videoRef.current.play();
      if (playing) videoRef.current.pause();

      setPlaying(!playing);
    }
  }, [playing]);

  const onVideoEnded = useCallback(() => {
    setPlaying(false);
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('ended', onVideoEnded);
    }
  }, [onVideoEnded]);

  return (
    <section className="relative z-10 bg-white">
      <Wrapper>
        <motion.div
          className="relative py-12 md:py-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <div className="space-y-10 xl:col-span-full col-span-2">
            <h1 className="text-5xl font-black text-black uppercase font-display lg:text-7xl">
              Knowledge Repository
            </h1>
            <h2 className="text-2xl font-medium text-black font-display md:text-3xl">
              At LandGriffon, we&apos;re dedicated to driving sustainability through science.
              Explore our repository for insights, methodologies, and datasets shaping environmental
              impact assessment and resource management.
            </h2>
          </div>
        </motion.div>
      </Wrapper>
    </section>
  );
};

export default Hero;
