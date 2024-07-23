import Intro from 'containers/repository/intro';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Link from 'next/link';
import Icon from 'components/icon';

import { Variants, motion } from 'framer-motion';

import ARROW_SVG from 'svgs/ui/arrow-right.svg?sprite';

import { DATA } from './constants';

const arrowMotion: Variants = {
  initial: { x: 0 },
  animate: { x: 5 },
  hover: { x: 20 },
};

const Webinar: React.FC = () => (
  <section className="relative bg-white">
    <Wrapper>
      <FadeIn>
        <Intro
          title="Webinar"
          intro="In our 2023 webinar we delved into the release of our new global, open-access datasets that aim to revolutionize nature accounting."
        >
          <ul className="md:grid md:grid-cols-3 gap-16 flex flex-col">
            {DATA.map(({ index, title, description }) => (
              <li key={title} className="flex flex-col space-y-4">
                <div className="space-y-2">
                  <span className="text-orange-500 text-[56px] -tracking-[2%] font-black">
                    {index}
                  </span>
                  <h4 className="font-medium text-3xl">{title}</h4>
                </div>
                <p>{description}</p>
              </li>
            ))}
            <li key="webinar" className="flex flex-col space-y-4 bg-orange-500 p-[35px]">
              <p className="font-light">Watch our webinar on demand to learn more</p>
              <Link href="https://bit.ly/3GbWOMa" passHref>
                <motion.a
                  whileHover="hover"
                  initial="initial"
                  animate="animate"
                  className="underline space-x-5 font-bold flex items-center hover:font-black"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span>Join us</span>
                  <motion.div
                    variants={arrowMotion}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    <Icon icon={ARROW_SVG} className="w-14 h-10" />
                  </motion.div>
                </motion.a>
              </Link>
            </li>
          </ul>
        </Intro>
      </FadeIn>
    </Wrapper>
  </section>
);

export default Webinar;
