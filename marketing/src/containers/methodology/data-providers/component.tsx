import { FC, useState } from 'react';
import cx from 'classnames';
import Image from 'next/image';
import FadeIn from 'components/fade';

import Wrapper from 'containers/wrapper';
import Carousel from 'components/carousel/component';

const SLIDES = [
  {
    id: '1',
    content: (
      <div className="w-full">
        <div className="space-y-5">
          <h4 className="text-xs uppercase">Forest loss & Land Carbon:</h4>

          <ul className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-20 lg:grid-cols-5 lg:gap-20">
            <li className="flex items-center justify-center">
              <a
                href="https://www.globalforestwatch.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  layout="intrinsic"
                  priority
                  src="/images/logos/gfw.png"
                  alt="GFW"
                  width={88}
                  height={88}
                />
              </a>
            </li>

            <li className="flex items-center justify-center">
              <a
                href="https://land.copernicus.eu/global/index.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  layout="intrinsic"
                  priority
                  src="/images/logos/copernicus_logo.png"
                  alt="copernicus"
                  width={191}
                  height={68}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: '2',
    content: (
      <div className="w-full">
        <div className="space-y-5">
          <h4 className="text-xs uppercase">Cropland & Yields:</h4>

          <ul className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-20 lg:grid-cols-5 lg:gap-20">
            <li className="flex items-center justify-center">
              <a href="http://www.earthstat.org/" target="_blank" rel="noopener noreferrer">
                <Image
                  layout="intrinsic"
                  priority
                  src="/images/logos/earthstat.png"
                  alt="earthstat"
                  width={228}
                  height={56}
                />
              </a>
            </li>

            <li className="flex items-center justify-center">
              <a href="https://www.mapspam.info/" target="_blank" rel="noopener noreferrer">
                <Image
                  layout="intrinsic"
                  priority
                  src="/images/logos/mapspam.png"
                  alt="mapspam"
                  width={88}
                  height={88}
                />
              </a>
            </li>

            <li className="flex items-center justify-center">
              <a href="https://www.fao.org/faostat/en/" target="_blank" rel="noopener noreferrer">
                <Image
                  layout="intrinsic"
                  priority
                  src="/images/logos/FAO.png"
                  alt="FAO"
                  width={88}
                  height={88}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: '3',
    content: (
      <div className="w-full">
        <div className="space-y-5">
          <h4 className="text-xs uppercase">Biodiversity:</h4>

          <ul className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-20 lg:grid-cols-5 lg:gap-20">
            <li className="flex items-center justify-center">
              <a
                href="https://www.worldwildlife.org/pages/conservation-science-data-and-tools"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  layout="intrinsic"
                  src="/images/logos/WWF.png"
                  alt="WWF"
                  width={85}
                  height={90}
                />
              </a>
            </li>

            <li className="flex items-center justify-center">
              <a
                href="https://www.ibat-alliance.org/?locale=en"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  layout="intrinsic"
                  src="/images/logos/IBAT.png"
                  alt="IBAT"
                  width={97}
                  height={35}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: '4',
    content: (
      <div className="w-full">
        <div className="space-y-5">
          <h4 className="text-xs uppercase">Water:</h4>

          <ul className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-20 lg:grid-cols-5 lg:gap-20">
            <li className="flex items-center justify-center">
              <a href="https://www.wri.org/aqueduct" target="_blank" rel="noopener noreferrer">
                <Image
                  layout="intrinsic"
                  src="/images/logos/aqueduct.png"
                  alt="aqueduct"
                  width={228}
                  height={56}
                />
              </a>
            </li>

            <li className="flex items-center justify-center">
              <a href="https://waterfootprint.org/en/" target="_blank" rel="noopener noreferrer">
                <Image
                  layout="intrinsic"
                  src="/images/logos/water-footprint-network.png"
                  alt="water-footprint-network"
                  width={191}
                  height={68}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
];

const DataProviders: FC = () => {
  const [slide, setSlide] = useState(0);
  return (
    <section className="bg-white ">
      <Wrapper>
        <FadeIn>
          <div className="space-y-10 pb-20">
            <div className="space-y-5">
              <h2 className="text-6xl font-black uppercase font-display max-w-lg">
                BUILT ON TRUSTED SCIENTIFIC DATA.
              </h2>
              <p className="pb-3 text-2xl font-light">
                Landgriffon is built on open-access data produced by leading researchers, NGOs, and
                government programs such as Copernicus, making it easier for you to take advantage
                of this scientific knowledge.
              </p>

              <div>
                <Carousel
                  slide={slide}
                  slides={SLIDES}
                  onChange={(i) => {
                    setSlide(i);
                  }}
                  autoplay={10000}
                  options={{
                    duration: 0,
                    circular: true,
                  }}
                />

                <div className="flex justify-center py-5 mt-10 space-x-5">
                  {SLIDES.map((sl, i) => {
                    return (
                      <button
                        key={sl.id}
                        type="button"
                        aria-label="dot-element"
                        onClick={() => {
                          setSlide(i);
                        }}
                        className={cx({
                          'relative w-2.5 h-2.5 rounded-full border-2 border-gray-400': true,
                        })}
                      >
                        {slide === i && (
                          <div className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 bg-gray-400 rounded-full left-1/2 top-1/2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-2xl font-light">LandGriffon is designed to meet your needs</h4>

              <ul className="space-y-5 font-bold">
                <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                  <p>
                    Measure water, land, deforestation, and biodiversity with included open data
                    sources.
                  </p>
                </li>

                <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                  <p>
                    Bring in any data source or API: spatial, non-spatial, financial, social, or
                    otherwise.
                  </p>
                </li>

                <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                  <p>Work with us to design custom metrics to meet specific needs or targets.</p>
                </li>
              </ul>
            </div>
          </div>
        </FadeIn>
      </Wrapper>
    </section>
  );
};

export default DataProviders;
