import { FC } from 'react';

import Wrapper from 'containers/wrapper';
import Link from 'next/link';

const ContactUs: FC = () => {
  return (
    <section className="lg:static relative bg-orange-500 lg:bg-white md:-mt-8 -mt-4">
      <Wrapper>
        <div className="relative z-10 md:py-32 py-12 xl:-mt-10 xl:px-20 xl:-mx-20 space-y-10 px-8 lg:bg-orange-500">
          <h2 className="text-4xl font-black uppercase md:text-6xl font-display">
            Drive positive impact with your supply chain.
          </h2>

          <Link href="/contact">
            <a className="px-7 py-5 border-2 border-black inline-block leading-8">
              <span>Contact us now</span>
            </a>
          </Link>
        </div>
      </Wrapper>
    </section>
  );
};

export default ContactUs;
