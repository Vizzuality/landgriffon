import { PauseIcon, PlayIcon } from '@heroicons/react/solid';
import Wrapper from 'containers/wrapper';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

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
          className="relative py-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <h1 className="font-black text-black uppercase font-display text-7xl">
            We use world-renowned datasets to analyze impacts.
          </h1>
        </motion.div>

        <motion.div
          className="relative aspect-video"
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

            <h4 className="text-sm font-black uppercase font-display">Whatch demo</h4>
          </header>
          <video ref={videoRef} src="/videos/truck.mp4" className="aspect-video" />
        </motion.div>

        <div className="mt-20 space-y-10">
          <div className="space-y-5">
            <h3 className="text-xl font-black text-black uppercase font-display">
              BUILT ON TRUSTED SCIENTIFIC DATA:
            </h3>
            <p className="text-2xl">
              We have embedded the work of pioneering NGOs and their open access data into our
              platform, making it easier for you to use and implement this scientific knowledge.
            </p>
          </div>

          <div className="space-y-5">
            <h4 className="text-xs uppercase">Data providers:</h4>

            <ul className="grid grid-cols-2 gap-20 md:grid-cols-4 lg:grid-cols-5">
              <li className="flex items-center justify-center">
                <Image
                  layout="intrinsic"
                  src="/images/logos/gfw.png"
                  alt="GFW"
                  width={62}
                  height={62}
                />
              </li>
              <li className="flex items-center justify-center">
                <Image
                  layout="intrinsic"
                  src="/images/logos/WWF.png"
                  alt="WWF"
                  width={43}
                  height={62}
                />
              </li>
              <li className="flex items-center justify-center">
                <Image
                  layout="intrinsic"
                  src="/images/logos/satelligence.png"
                  alt="satelligence"
                  width={198}
                  height={29}
                />
              </li>
              <li className="flex items-center justify-center">
                <Image
                  layout="intrinsic"
                  src="/images/logos/WRI.png"
                  alt="WRI"
                  width={120}
                  height={72}
                />
              </li>
              <li className="flex items-center justify-center">
                <Image
                  layout="intrinsic"
                  src="/images/logos/water-footprint-network.png"
                  alt="water-footprint-network"
                  width={111}
                  height={50}
                />
              </li>

              <li className="flex items-center justify-center">
                <Image
                  layout="intrinsic"
                  src="/images/logos/mapspam.png"
                  alt="mapspam"
                  width={113}
                  height={50}
                />
              </li>
              <li className="flex items-center justify-center">
                <Image
                  layout="intrinsic"
                  src="/images/logos/FAO.png"
                  alt="FAO"
                  width={62}
                  height={63}
                />
              </li>
              <li className="flex items-center justify-center">
                <Image
                  layout="intrinsic"
                  src="/images/logos/aqueduct.png"
                  alt="aqueduct"
                  width={166}
                  height={34}
                />
              </li>
              <li className="flex items-center justify-center">
                <Image
                  layout="intrinsic"
                  src="/images/logos/earthstat.png"
                  alt="earthstat"
                  width={149}
                  height={37}
                />
              </li>
            </ul>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default Hero;
