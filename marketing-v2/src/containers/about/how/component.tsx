import Link from 'next/link';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

import Icon from 'components/icon';

import ARROW_TOP_RIGHT_SVG from 'svgs/ui/arrow-top-right.svg?sprite';

const How: React.FC = () => {
  return (
    <section className="relative py-32 bg-blue-600 bg-cover md:py-64">
      <Wrapper>
        <div className="max-w-2xl mx-auto space-y-10 text-center text-white md:space-y-20">
          <FadeIn>
            <p className="text-xl">
              We help companies create strategies for change through technology, data, and advice on
              how to manage supply chain impacts.
            </p>
          </FadeIn>
          <FadeIn>
            <p className="text-xl">
              We’ve created a business-centric platform to simplify the process of supply chain
              environmental risk management.
            </p>
          </FadeIn>
          <FadeIn>
            <Link href="/methodology">
              <a className="text-xl text-orange-500 inline-flex justify-center items-center space-x-2.5">
                <span>Learn how it works</span>
                <Icon icon={ARROW_TOP_RIGHT_SVG} className="w-3 h-3" />
              </a>
            </Link>
          </FadeIn>
        </div>
      </Wrapper>
    </section>
  );
};

export default How;
