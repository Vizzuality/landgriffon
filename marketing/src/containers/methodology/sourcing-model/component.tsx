import Image from 'next/image';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

const SourcingModel: React.FC = () => {
  return (
    <section className="relative py-12 space-y-12 bg-blue-600 bg-cover md:space-y-64 md:py-64">
      <Wrapper>
        <div className="space-y-10 text-white md:space-y-20">
          <FadeIn>
            <h2 className="text-5xl font-black text-white uppercase max-w-3xl font-display md:text-7xl">
              Our spatial <span className="text-orange-500">sourcing model. </span>
            </h2>
          </FadeIn>

          <div className="space-y-4">
            <FadeIn>
              <p className="text-white inline-block text-2xl font-light leading-tight">
                Nature metrics need spatial information.{' '}
                <span className="text-black bg-orange-500">
                  Regardless of how much data you have on your supply chain, LandGriffon is built
                  for you.
                </span>
              </p>
            </FadeIn>

            <FadeIn>
              <p className="text-2xl font-light leading-relaxed">
                Our sourcing model maps supply chains using a combination of the information you
                provide, gridded crop production, and international trade data.
              </p>
            </FadeIn>

            <FadeIn>
              <p className="text-2xl font-light leading-relaxed">
                LandGriffon combines these maps with satellite-based and spatial data sources to
                calculate impacts. The method is the same for globally sourced commodities or exact
                farm locations, meaning our single tool will cater for an entire supply chain and
                its range of sourcing information.
              </p>
            </FadeIn>
          </div>
          <FadeIn>
            <div className="space-y-10 lg:space-x-20 lg:space-y-0">
              <div className="w-full space-y-4">
                <div className="grid grid-cols-2 gap-8">
                  <h4 className="text-xs uppercase">Sourcing location time</h4>
                  <h4 className="text-xs uppercase">Modeled likely production areas</h4>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-white pt-4">
                  <div className="space-y-2">
                    <p className="font-bold text-white"> Aggregation point</p>
                    <p className="text-orange-500 font-light text-2xl max-w-xs">
                      Produced within 50km of this location
                    </p>
                  </div>

                  <div className="w-full">
                    <Image
                      width={443}
                      height={208}
                      layout="responsive"
                      src="/images/methodology/sourcing/sourcing_1.png"
                      className="block w-full"
                      alt="Aggregation point"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-white pt-4">
                  <div className="space-y-2">
                    <p className="font-bold text-white"> Producer country or jurisdiction</p>
                    <p className="text-orange-500 font-light text-2xl max-w-xs">
                      Produced within this country or jurisdiction.
                    </p>
                  </div>

                  <div className="w-full">
                    <Image
                      width={443}
                      height={208}
                      layout="responsive"
                      src="/images/methodology/sourcing/sourcing_2.png"
                      className="block w-full"
                      alt="Producer country or jurisdiction image"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-white pt-4">
                  <div className="space-y-2">
                    <p className="font-bold text-white"> Delivery country</p>
                    <p className="text-orange-500 font-light text-2xl max-w-xs">
                      Produced within or imported to this country.
                    </p>
                  </div>
                  <div className="flex">
                    <div className="w-full">
                      <Image
                        width={207}
                        height={208}
                        layout="responsive"
                        src="/images/methodology/sourcing/sourcing_3.png"
                        className="block w-full"
                        alt="Delivery country image"
                      />
                    </div>

                    <div className="w-full">
                      <Image
                        width={207}
                        height={208}
                        layout="responsive"
                        src="/images/methodology/sourcing/sourcing_4.png"
                        className="block w-full"
                        alt="Delivery country image"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Wrapper>
    </section>
  );
};

export default SourcingModel;
