import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

import Icon from 'components/icon';

import ARROW_TOP_RIGHT_SVG from 'svgs/ui/arrow-top-right.svg?sprite';
import Image from 'next/image';

const Rason: React.FC = () => {
  return (
    <section className="relative py-12 space-y-12 bg-blue-600 bg-cover md:space-y-64 md:py-64">
      <Wrapper>
        <div className="space-y-10 text-white md:space-y-20">
          <FadeIn>
            <h2 className="text-5xl font-black text-white uppercase font-display md:text-7xl">
              Sustainability is <span className="text-orange-500">more than a buzzword. </span>
            </h2>
          </FadeIn>
          <FadeIn>
            <p className="text-2xl font-light leading-relaxed">
              We urgently need to move towards a zero-carbon and nature positive future. LandGriffon
              is one part of a much wider sustainable revolution.
            </p>
          </FadeIn>
          <FadeIn>
            <div className="flex flex-col space-y-10 lg:flex-row lg:justify-between lg:space-x-20 lg:space-y-0">
              <div className="w-full">
                <p className="text-2xl font-light leading-relaxed">
                  The world needs innovation, prioritization and action across the spectrum, from
                  NGOs to corporates, farmers to consumers.
                </p>
              </div>

              <div className="w-full space-y-5">
                <p className="font-bold">
                  As a community, we aim to transform agricultural supply chains to achieve:{' '}
                </p>

                <ul className="space-y-5 font-light">
                  <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                    Sector wide net zero GHG emissions.
                  </li>
                  <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                    Biodiversity preservation.
                  </li>
                  <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                    Deforestation and conversion free supply chains.
                  </li>
                  <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                    Sustainable use of freshwater resources.
                  </li>
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </Wrapper>

      <Wrapper>
        <div className="space-y-10 text-white md:space-y-20">
          <FadeIn>
            <h2 className="text-5xl font-black text-white uppercase font-display md:text-7xl">
              LandGriffon
              <span className="text-blue-500"> POWERED BY VIZZUALITY. </span>
            </h2>
          </FadeIn>
          <FadeIn>
            <p className="inline-block text-2xl font-bold leading-relaxed text-black px-2.5 -mx-2.5 mb-5">
              <span className="bg-blue-500">
                With over 13 years of experience, we combine design, science, technology,
                sustainability, and business.
              </span>
            </p>
            <div className="space-y-10">
              <p className="text-2xl font-light leading-relaxed">
                Vizzuality is a change-driven design and technology agency creating bespoke,
                science-based data visualizations and digital tools that inspire learning, catalyze
                decisions and improve our world. We help companies access, understand, and
                efficiently use the data and recommendations of the sustainability community.
              </p>
              <p className="text-2xl font-light leading-relaxed">
                We work together with proactive organizations to create a better future for our
                planet and society. We have over 13 years of experience working with world-changing
                organizations building platforms like Global Forest Watch, Aqueduct and Trase.
              </p>

              <div>
                <a
                  href="https://www.vizzuality.com/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex text-xl justify-center items-center space-x-2.5 text-orange-500"
                >
                  <span>Discover Vizzuality</span>
                  <Icon icon={ARROW_TOP_RIGHT_SVG} className="w-3 h-3" />
                </a>
              </div>
              <ul className="grid grid-cols-2 gap-10 xs:grid-cols-3 md:grid-cols-5">
                <li>
                  <a href="https://www.un.org/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/UN_logo.png"
                      alt="UN"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a href="https://www.nasa.gov/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/nasa_logo.png"
                      alt="NASA"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a href="https://www.google.com/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/Google_logo.png"
                      alt="Google"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a href="https://www.wri.org/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/WRI_logo.png"
                      alt="WRI"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
              </ul>
            </div>
          </FadeIn>
        </div>
      </Wrapper>

      <div>
        <div className="pt-12 border-t md:pt-32 md:-mt-32 border-white/10">
          <Wrapper>
            <div className="space-y-32 text-white md:space-y-32">
              <FadeIn>
                <div className="flex flex-col space-y-10 lg:flex-row lg:justify-between lg:space-x-20 lg:space-y-0">
                  <div className="w-full space-y-5">
                    <h4 className="relative font-bold pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                      Kickstarted by the European Commission
                    </h4>

                    <p className="pl-5">
                      To encourage the development at the pace needed, the European Commission
                      granted Vizzuality, with support from Satelligence and Stockholm Environment
                      Institute, as part of the Horizon 2020 research and innovation programme to
                      develop tools to assist food industry companies to manage environmental
                      impacts and risks in their supply chains.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </Wrapper>
        </div>
      </div>
    </section>
  );
};

export default Rason;
