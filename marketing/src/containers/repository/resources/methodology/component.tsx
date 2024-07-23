import Intro from 'containers/repository/intro';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Link from 'next/link';
import Icon from 'components/icon';

import CALENDAR_SVG from 'svgs/ui/calendar.svg?sprite';

const Methodology: React.FC = () => (
  <section className="relative bg-white">
    <Wrapper>
      <FadeIn>
        <Intro
          title="Methodology:"
          intro="Access previous versions of our methodologies to understand the evolution of our
                  approach to sustainability and environmental impact assessments."
        >
          <div className="md:grid md:grid-cols-2 md:gap-6 text-white flex flex-col space-y-6 md:space-y-0">
            <div className="bg-[url('/images/repository/methodology_bg_1.jpg')] flex h-[400px] bg-cover p-5">
              <div className="bg-blue-900 p-6 space-y-4 h-fit">
                <div className="flex space-x-2.5 items-center">
                  <Icon icon={CALENDAR_SVG} className="w-6 h-6" />
                  <span>October 2023:</span>
                </div>
                <Link href="https://landgriffon.com/docs/LG_Methodology_Technical_Note.pdf">
                  <a
                    className="text-white underline text-[25px] w-full inline-block md:pr-12 pr-4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Methodology Version <span className="md:block">0.2 </span>
                  </a>
                </Link>
              </div>
            </div>

            <div className="bg-[url('/images/repository/methodology_bg_2.png')] flex h-[400px] bg-cover p-5">
              <div className="bg-blue-900 p-6 space-y-4 h-fit">
                <div className="flex space-x-2.5 items-center">
                  <Icon icon={CALENDAR_SVG} className="w-6 h-6" />
                  <span>October 2022:</span>
                </div>
                <Link href="https://landgriffon.com/docs/LG_Methodology_Technical_Note.pdf">
                  <a
                    className="text-white underline text-[25px] inline-block md:pr-12 pr-4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Methodology Version <span className="md:block">0.1 </span>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </Intro>
      </FadeIn>
    </Wrapper>
  </section>
);

export default Methodology;
