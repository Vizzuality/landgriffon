import Link from 'next/link';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';
import FLEXIBLE_SVG from 'svgs/home/features/icn_flexible.svg?sprite';
import COMMUNITY_SVG from 'svgs/home/features/icn_comm.svg?sprite';
import ETHOS_SVG from 'svgs/home/features/icn_search.svg?sprite';

const Features: React.FC = () => {
  return (
    <section className="relative py-12 bg-white md:py-32">
      <Wrapper>
        <div className="space-y-10 md:space-y-20">
          <FadeIn>
            <h2 className="text-4xl font-black uppercase md:text-6xl md:w-5/12 font-display">
              LandGriffon is built with you in mind.
            </h2>
          </FadeIn>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-10 md:gap-y-20 md:gap-x-32 lg:gap-x-64">
            <li>
              <FadeIn className="space-y-5 md:space-y-10">
                <div className="space-y-5">
                  <Icon icon={FLEXIBLE_SVG} className="w-14 h-14" />
                  <h3 className="text-3xl font-medium font-display">Flexible to your needs.</h3>
                </div>
                <p className="text-xl">
                  LandGriffon is designed to adapt to each company&apos;s unique context and
                  ambitions. Regardless of the amount or detail of your existing data, we can work
                  with you.
                </p>
              </FadeIn>
            </li>
            <li>
              <FadeIn className="space-y-5 md:space-y-10">
                <div className="space-y-5">
                  <Icon icon={COMMUNITY_SVG} className="w-14 h-14" />
                  <h3 className="text-3xl font-medium font-display">Community powered.</h3>
                </div>

                <p className="text-xl">
                  LandGriffon brings together the most trusted data from across the sustainability
                  community.
                </p>
                <Link href="/methodology">
                  <a className="flex items-center justify-between space-x-5">
                    <span className="font-semibold underline">
                      Learn more about the indicators we use.
                    </span>
                    <Icon icon={ARROW_RIGHT_SVG} className="w-12 h-12" />
                  </a>
                </Link>
              </FadeIn>
            </li>
            <li>
              <FadeIn className="space-y-5 md:space-y-10">
                <div className="space-y-5">
                  <Icon icon={ETHOS_SVG} className="w-14 h-14" />
                  <h3 className="text-3xl font-medium font-display">An ethos of transparency.</h3>
                </div>

                <p className="text-xl">
                  We&apos;re confident in our technology, and you should be too. Our methods and
                  code are open for all to see, use, and verify.
                </p>

                <Link href="/methodology">
                  <a className="flex items-center justify-between space-x-5">
                    <span className="font-semibold underline">
                      Learn more about our methodology.
                    </span>
                    <Icon icon={ARROW_RIGHT_SVG} className="w-12 h-12" />
                  </a>
                </Link>
              </FadeIn>
            </li>
            <li>
              <FadeIn className="space-y-5 md:pr-10 md:space-y-10">
                <div className="relative w-full pb-[100%]">
                  <Link href="/contact?topic=contact">
                    <a className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full p-5 space-y-10 bg-orange-500 rounded-full">
                      <h3 className="text-3xl font-medium text-center font-display">
                        Want to <br /> know more?
                      </h3>

                      <div className="underline cursor-pointer">Get in touch</div>
                    </a>
                  </Link>
                </div>
              </FadeIn>
            </li>
          </ul>
        </div>

        <div className="flex space-x-2 translate-y-16 md:space-x-6">
          <motion.iframe
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            width="853"
            height="480"
            src="https://www.youtube.com/embed/rUl8jQkyJuw"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Landgriffon: Sustainable Supply Chain Solutions"
            className="w-full h-[190px] md:h-[438px] lg:h-[603px]"
          />
        </div>
      </Wrapper>
    </section>
  );
};

export default Features;
