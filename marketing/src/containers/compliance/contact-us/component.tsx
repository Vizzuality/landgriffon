import { FC } from 'react';

import Wrapper from 'containers/wrapper';
import Link from 'next/link';

const ContactUs: FC = () => {
  return (
    <section className="bg-orange-500 xl:bg-white">
      <Wrapper>
        <div className="relative z-10 pt-12 bg-orange-500 md:pt-20 xl:-mt-10 xl:px-20 xl:-mx-20">
          <div className="pb-10 space-y-6">
            <h2 className="text-4xl font-black uppercase md:text-6xl font-display">
              Share your thoughts
            </h2>
            <p className="text-2xl font-light">
              Our methodology has been validated by{' '}
              <a
                className="underline font-bold"
                href="https://satelligence.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Satelligence
              </a>
              , the{' '}
              <a
                className="underline font-bold"
                href="https://www.sei.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stockholm Environment Institute
              </a>{' '}
              and their{' '}
              <a
                className="underline font-bold"
                href="https://www.trase.earth/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Trase
              </a>{' '}
              initiative. We are keen to collaborate with the wider research and policy community
              towards a common goal of supply chain sustainability.
            </p>
          </div>

          <div className="flex items-end py-8 border-t border-black/10">
            <p className="font-light text-xl">
              If you have any feedback or if we can be of help:{' '}
              <Link href="/contact">
                <a className="underline font-bold">
                  <span>Contact us now</span>
                </a>
              </Link>
            </p>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default ContactUs;
