import { FC, useState } from 'react';
import Image from 'next/image';
import FadeIn from 'components/fade';

import Wrapper from 'containers/wrapper';
import Carousel from 'components/carousel/component';
import Link from 'next/link';
import Icon from 'components/icon';

import { AnimatePresence, motion } from 'framer-motion';
import ARROW_SVG from 'svgs/ui/arrow-top-right.svg?sprite';

type CardTypes = {
  thumb: string;
  title: string;
  description: string;
};

const arrow = {
  default: {
    opacity: 0,
    x: -55,
    transition: {
      duration: 0,
      type: 'tween',
      delay: 0,
    },
  },
  hover: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      type: 'tween',
    },
  },
};

const Card: FC<CardTypes> = ({ thumb, title, description }: CardTypes) => (
  <motion.div
    initial="default"
    whileHover="hover"
    className="min-h-[430px] relative rounded-[38px] w-full border border-[#1D3786] border-opacity-90 space-y-5 flex flex-col p-14 items-start hover:bg-blue-900 hover:cursor-pointer"
  >
    <Image src={thumb} width={78} height={74} alt={title} layout="intrinsic" />
    <h5 className="font-bold text-xl flex">{title}</h5>
    <p className="font-light flex">{description}</p>
    <motion.div variants={arrow} className="w-full justify-end flex absolute bottom-14 right-14">
      <Icon icon={ARROW_SVG} className="w-14 h-11 rotate-45" />
    </motion.div>
  </motion.div>
);

const SLIDES = [
  {
    id: '1',
    content: (
      <div>
        <div className="md:grid md:grid-cols-2 md:gap-5 w-full flex flex-col space-y-6 md:space-y-0">
          <Card
            thumb="/images/repository/thumb_1.png"
            title="LandGriffon case study."
            description="An example analysis of the impact of hypothetical sourcing of 1000 tonnes of palm oil in Aceh, Indonesia, with different levels of spatial sourcing precision and exploration of scenarios."
          />

          <Card
            thumb="/images/repository/thumb_2.png"
            title="Evolving ESG regulations"
            description="Three key proposals will change the ESG regulatory landscape. The EU CSRD & ESRS, SEC Climate-Related Disclosures, and EU Deforestation Law."
          />
        </div>
      </div>
    ),
  },
  {
    id: '2',
    content: (
      <div>
        <div className="md:grid md:grid-cols-2 md:gap-5 w-full flex flex-col space-y-6 md:space-y-0">
          <Card
            thumb="/images/repository/thumb_1.png"
            title="LandGriffon case study."
            description="An example analysis of the impact of hypothetical sourcing of 1000 tonnes of palm oil in Aceh, Indonesia, with different levels of spatial sourcing precision and exploration of scenarios."
          />

          <Card
            thumb="/images/repository/thumb_2.png"
            title="Evolving ESG regulations"
            description="Three key proposals will change the ESG regulatory landscape. The EU CSRD & ESRS, SEC Climate-Related Disclosures, and EU Deforestation Law."
          />
        </div>
      </div>
    ),
  },
  {
    id: '3',
    content: (
      <div>
        <div className="md:grid md:grid-cols-2 md:gap-5 w-full flex flex-col space-y-6 md:space-y-0">
          <Card
            thumb="/images/repository/thumb_1.png"
            title="LandGriffon case study."
            description="An example analysis of the impact of hypothetical sourcing of 1000 tonnes of palm oil in Aceh, Indonesia, with different levels of spatial sourcing precision and exploration of scenarios."
          />

          <Card
            thumb="/images/repository/thumb_2.png"
            title="Evolving ESG regulations"
            description="Three key proposals will change the ESG regulatory landscape. The EU CSRD & ESRS, SEC Climate-Related Disclosures, and EU Deforestation Law."
          />
        </div>
      </div>
    ),
  },
  {
    id: '4',
    content: (
      <div>
        <div className="md:grid md:grid-cols-2 md:gap-5 w-full flex flex-col space-y-6 md:space-y-0">
          <Card
            thumb="/images/repository/thumb_1.png"
            title="LandGriffon case study."
            description="An example analysis of the impact of hypothetical sourcing of 1000 tonnes of palm oil in Aceh, Indonesia, with different levels of spatial sourcing precision and exploration of scenarios."
          />

          <Card
            thumb="/images/repository/thumb_2.png"
            title="Evolving ESG regulations"
            description="Three key proposals will change the ESG regulatory landscape. The EU CSRD & ESRS, SEC Climate-Related Disclosures, and EU Deforestation Law."
          />
        </div>
      </div>
    ),
  },
];

const DiscoverOurJourney: FC = () => {
  const [slide, setSlide] = useState(0);
  return (
    <section className="relative py-12 space-y-12 bg-blue-600 bg-cover md:space-y-64 md:py-36 overflow-hidden text-white">
      <Wrapper>
        <FadeIn>
          <div className="space-y-10 pb-20">
            <div className="space-y-11">
              <div className="flex justify-between items-center border-t border-t-[#1D3786] pt-2">
                <h2 className="text-xl font-black uppercase font-display max-w-lg">
                  Discover our journey
                </h2>
                <Link href="/contact">
                  <a className="flex space-x-4 text-orange-500 font-semibold">
                    <span>Discover more about us</span>
                    <Icon icon={ARROW_SVG} className="w-4 h-4 rotate-12" />
                  </a>
                </Link>
              </div>

              <div>
                <Carousel
                  slide={slide}
                  slides={SLIDES}
                  onChange={(i) => {
                    setSlide(i);
                  }}
                  autoplay={10000}
                  options={{
                    duration: 0,
                    circular: true,
                  }}
                />

                <div className="flex justify-center py-5 mt-10 space-x-5">
                  {SLIDES.map((sl, i) => {
                    return (
                      <button
                        key={sl.id}
                        type="button"
                        aria-label="dot-element"
                        onClick={() => {
                          setSlide(i);
                        }}
                        className="relative w-2.5 h-2.5 rounded-full border-2 border-white"
                      >
                        {slide === i && (
                          <div className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 bg-orange-400 rounded-full left-1/2 top-1/2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Wrapper>
    </section>
  );
};

export default DiscoverOurJourney;
