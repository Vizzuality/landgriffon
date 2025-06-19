import { FC } from 'react';

import Wrapper from 'containers/wrapper';
import Link from 'next/link';

const ContactUs: FC = () => {
  return (
    <section className="bg-orange-500 xl:bg-white">
      <Wrapper>
        <div className="relative z-10 md:py-32 py-12 bg-orange-500 xl:-mt-10 xl:px-20 xl:-mx-20 space-y-10">
          <h2 className="text-4xl font-black uppercase md:text-6xl font-display">
            Interested in how LandGriffon can help you with EUDR compliance?
          </h2>

          <Link
            href="/contact"
            className="px-7 py-5 border-2 border-black inline-block leading-8 hover:bg-black/10"
            passHref
          >
            <span>Contact us now</span>
          </Link>
        </div>
      </Wrapper>
    </section>
  );
};

export default ContactUs;
