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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-10 col-span-full xl:col-span-2">
              <h1 className="text-5xl font-black text-black uppercase font-display md:text-7xl">
                Analyze impacts with world-renowned datasets.
              </h1>

              <h2 className="text-2xl font-medium text-black font-display md:text-3xl">
                Download our methodology and find out how LandGriffon works.
              </h2>

              <div className="flex flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-6 xl:justify-between">
                <a
                  href="https://bit.ly/3ONp1MJ"
                  rel="noreferrer noopener"
                  target="_blank"
                  className="flex-1 p-5 border-2 border-black group hover:bg-black/10"
                >
                  <div className="flex space-x-3">
                    <div className="relative block w-10 h-10 transition-colors bg-gray-100 rounded-full group-hover:bg-orange-500">
                      <Icon
                        icon={DOWNLOAD_SVG}
                        className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-black">Full methodology</h4>
                      <p className="text-sm text-black/40">
                        In-depth description of every feature.
                      </p>
                    </div>
                  </div>
                </a>
                <a
                  href="https://bit.ly/3gIJq9n"
                  rel="noreferrer noopener"
                  target="_blank"
                  className="flex-1 p-5 border-2 border-black group hover:bg-black/10"
                >
                  <div className="flex space-x-3">
                    <div className="relative block w-10 h-10 transition-colors bg-gray-100 rounded-full group-hover:bg-orange-500">
                      <Icon
                        icon={DOWNLOAD_SVG}
                        className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-black">Executive summary</h4>
                      <p className="text-sm text-black/40">An overview of how it functions.</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <div className="justify-center hidden w-full h-full xl:flex xl:visible">
              <div className="relative w-full h-full">
                <Image
                  layout="fill"
                  src="/images/methodology/methodology_front.svg"
                  alt="methodology cover book"
                />
              </div>
            </div>
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
          <video ref={videoRef} src="/videos/truck.mp4" className="aspect-video" />
        </motion.div>
      </Wrapper>
    </section>
  );
};

export default Hero;
