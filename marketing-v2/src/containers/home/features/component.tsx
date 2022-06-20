import Icon from 'components/icon';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

import FLEXIBLE_SVG from 'svgs/home/features/icn_flexible.svg?sprite';
import COMMUNITY_SVG from 'svgs/home/features/icn_comm.svg?sprite';
import ETHOS_SVG from 'svgs/home/features/icn_search.svg?sprite';

const Features: React.FC = () => {
  return (
    <section className="relative py-32 bg-white">
      <Wrapper>
        <div className="space-y-20 py">
          <FadeIn>
            <h2 className="w-5/12 text-6xl font-black uppercase font-display">
              LandGriffon is built with you in mind.
            </h2>
          </FadeIn>

          <ul className="grid grid-cols-2 gap-y-20 gap-x-64">
            <li>
              <FadeIn className="space-y-10">
                <div className="space-y-5">
                  <Icon icon={FLEXIBLE_SVG} className="w-14 h-14" />
                  <h3 className="text-3xl font-medium font-display">Flexible to your needs.</h3>
                </div>
                <p>
                  LandGriffon is designed to adapt to each company&apos;s unique context and
                  ambitions. Regardless of the amount or detail of your existing data, we can work
                  with you.
                </p>
              </FadeIn>
            </li>
            <li>
              <FadeIn className="space-y-10">
                <div className="space-y-5">
                  <Icon icon={COMMUNITY_SVG} className="w-14 h-14" />
                  <h3 className="text-3xl font-medium font-display">Community powered.</h3>
                </div>

                <p>
                  LandGriffon brings together the most trusted indicator data from across the
                  sustainability community. Learn more about the indicators we use.
                </p>
              </FadeIn>
            </li>
            <li>
              <FadeIn className="space-y-10">
                <div className="space-y-5">
                  <Icon icon={ETHOS_SVG} className="w-14 h-14" />
                  <h3 className="text-3xl font-medium font-display">An ethos of transparency.</h3>
                </div>

                <p>
                  We’re confident in our technology, and you should be too. Our methods and code are
                  open for all to see, use, and verify.
                </p>
              </FadeIn>
            </li>
            <li>
              <FadeIn className="pr-10 space-y-10">
                <div className="relative w-full pb-[100%]">
                  <div className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full p-5 space-y-10 bg-orange-500 rounded-full">
                    <h3 className="text-3xl font-medium text-center font-display">
                      Want to <br /> know more?
                    </h3>

                    <a className="underline cursor-pointer">Get in touch</a>
                  </div>
                </div>
              </FadeIn>
            </li>
          </ul>
        </div>
      </Wrapper>
    </section>
  );
};

export default Features;
