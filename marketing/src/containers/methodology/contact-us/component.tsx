import { FC } from 'react';

import Wrapper from 'containers/wrapper';
import Link from 'next/link';

import Icon from 'components/icon';
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';

const ContactUs: FC = () => {
  return (
    <section className="bg-orange-500 xl:bg-white">
      <Wrapper>
        <div className="relative z-10 py-12 space-y-6 bg-orange-500 md:py-20 xl:-mt-10 xl:px-20 xl:-mx-20">
          <h2 className="text-4xl font-black uppercase md:text-6xl font-display">
            Share your thoughts
          </h2>
          <p>
            We believe sector-wide transformation will come from sharing knowledge and expertise.
            That is why our code is open-source and our science is open and transparent. We welcome
            any input and feedback you would like to share with us.
          </p>
          <div className="flex justify-end">
            <Link href="/contact">
              <a className="flex items-center space-x-5 underline">
                <span>Contact us</span>
                <Icon icon={ARROW_RIGHT_SVG} className="w-12 h-12" />
              </a>
            </Link>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default ContactUs;
