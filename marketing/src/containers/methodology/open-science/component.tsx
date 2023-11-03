import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Link from 'next/link';
import Image from 'next/image';

const OpenScience: React.FC = () => {
  return (
    <section className="relative py-12 space-y-12 bg-blue-600 bg-cover md:space-y-64 md:py-36 overflow-hidden">
      <Wrapper>
        <div className="grid grid-cols-2">
          <div className="space-y-6 text-white md:space-y-10">
            <FadeIn>
              <h2 className="text-5xl font-black text-white uppercase max-w-3xl font-display md:text-7xl">
                Open source & <span className="text-blue-500">open science. </span>
              </h2>
            </FadeIn>

            <div className="space-y-10">
              <FadeIn>
                <div className="space-y-8">
                  <p className="text-white inline-block text-2xl font-light leading-tight">
                    <span className="text-black bg-blue-500">
                      Our service is built on the foundations of trust and transparency, 
                    </span>
                    only possible through open-source development and an open-science methodology.
                  </p>

                  <p className="text-white inline-block text-2xl font-light leading-tight">
                    It is important that the methods used to evaluate company performance are
                    transparent and verifiable. Through maximising intellectual access, we hope to
                    maximise change.
                  </p>
                </div>
              </FadeIn>

              <FadeIn>
                <div className="flex space-x-5">
                  <div className="px-6 py-5 font-semibold text-white bg-transparent border-2 border-white hover:bg-white/10">
                    <a
                      href="https://github.com/Vizzuality/landgriffon"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Open-source development
                    </a>
                  </div>

                  <Link href="/methodology">
                    <a className="px-5 py-4 font-semibold text-white bg-transparent border-2 border-white hover:bg-white/10">
                      Open-science methodology
                    </a>
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>

          <div className="absolute -right-32 top-1/4 w-1/2">
            <div className="w-full">
              <Image
                priority
                alt="Screen 04"
                src="/images/methodology/open-science/screen_02.png"
                width={1000}
                height={615.86}
                layout="responsive"
              />
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default OpenScience;
