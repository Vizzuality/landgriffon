import Link from 'next/link';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

import ENTERPRISE_SVG from 'svgs/home/features/icn_enterprise.svg?sprite';
import PICTURE_SVG from 'svgs/home/features/icn_picture.svg?sprite';
import SCIENCE_SVG from 'svgs/home/features/icn_science.svg?sprite';

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
                  <Icon icon={ENTERPRISE_SVG} className="w-14 h-14" />
                  <h3 className="text-3xl font-medium font-display">Enterprise-ready.</h3>
                </div>
                <p className="text-xl">
                  Align with new standards and requirements (ESRS, TNFD, SBTN). Produce transparent,
                  repeatable, and auditable analysis.
                </p>
              </FadeIn>
            </li>
            <li>
              <FadeIn className="space-y-5 md:space-y-10">
                <div className="space-y-5">
                  <Icon icon={PICTURE_SVG} className="w-14 h-14" />
                  <h3 className="text-3xl font-medium font-display">See the big picture.</h3>
                </div>

                <p className="text-xl">
                  Manage the whole of your supply chain, rather than one material or one impact at a
                  time. Bring in any data source or API: spatial, non-spatial, financial, social, or
                  otherwise.
                </p>
              </FadeIn>
            </li>
            <li>
              <FadeIn className="space-y-5 md:space-y-10">
                <div className="space-y-5">
                  <Icon icon={SCIENCE_SVG} className="w-14 h-14" />
                  <h3 className="text-3xl font-medium font-display">
                    Built with the best available science.
                  </h3>
                </div>

                <p className="text-xl">
                  Leverage the latest data and recommendations from satellite monitoring and the
                  scientific community. Our open-science methodology is trusted to help you plan and
                  prepare for tomorrow’s risks and opportunities.
                </p>
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
