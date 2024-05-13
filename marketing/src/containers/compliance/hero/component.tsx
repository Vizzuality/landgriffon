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
          <div className="space-y-10">
            <h1 className="text-5xl font-black text-black uppercase font-display md:text-7xl">
              ESG Compliance with LandGriffon
            </h1>
          </div>
        </motion.div>

        <motion.div
          className="relative hidden aspect-video"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <header className="absolute z-10 flex items-center space-x-5 text-white top-6 left-6">
            <button
              className="flex items-center justify-center w-20 h-20 bg-white cursor-pointer"
              onClick={onTogglePlay}
            >
              {!playing && <PlayIcon className="w-5 h-5 text-black" />}
              {playing && <PauseIcon className="w-5 h-5 text-black" />}
            </button>

            <h4 className="text-sm font-black uppercase font-display">Watch demo</h4>
          </header>
          {/* <video ref={videoRef} src="/videos/truck.mp4" className="aspect-video" /> */}
        </motion.div>
      </Wrapper>
    </section>
  );
};

export default Hero;
