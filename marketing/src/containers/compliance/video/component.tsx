import { FC } from 'react';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Wrapper from 'containers/wrapper';
import { Media } from 'components/media-query';
import Image from 'next/image';
import { PlayIcon, PauseIcon } from '@heroicons/react/solid';

const Video: FC = () => {
  const videoRef = useRef<HTMLVideoElement>();
  const { ref, inView } = useInView();
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
    if (videoRef.current && !inView) {
      videoRef.current.pause();
    }

    if (videoRef.current) {
      videoRef.current.addEventListener('ended', onVideoEnded);
    }
  }, [inView, onVideoEnded]);

  return (
    <section className="bg-white">
      <div className="relative z-20">
        <Wrapper>
          <section ref={ref} className="relative max-h-screen bg-white">
            <Media lessThan="md">
              <Image
                layout="responsive"
                src="/images/compliance/video_image.jpg"
                alt="EUDR tool"
                width={375}
                height={211}
              />
            </Media>
            <Media greaterThanOrEqual="md">
              <div className="relative w-full min-h-full space-y-12 mx-auto pt-12">
                <header className="absolute z-10 flex items-center space-x-5 text-white -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                  <button
                    className="flex items-center justify-center w-20 h-20 bg-black cursor-pointer"
                    onClick={onTogglePlay}
                  >
                    {!playing && <PlayIcon className="w-5 h-5 text-white" />}
                    {playing && <PauseIcon className="w-5 h-5 text-white" />}
                  </button>
                </header>
                <video
                  ref={videoRef}
                  src="/videos/LG_EUDR_V3.mp4"
                  className="w-full h-full aspect-auto"
                />
              </div>
            </Media>
          </section>
        </Wrapper>
      </div>
      <Media greaterThanOrEqual="md">
        <div className="flex flex-col justify-end overflow-hidden relative z-10 -mt-96 h-[696px]">
          <Image
            alt="field"
            src="/images/compliance/hero_1.jpg"
            layout="fill"
            objectFit="fill"
            objectPosition="top"
          />
        </div>
      </Media>
    </section>
  );
};
export default Video;
