import Intro from 'containers/repository/intro';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Link from 'next/link';
import Icon from 'components/icon';

import ARROW_SVG from 'svgs/ui/arrow-top-right.svg?sprite';

import { DATASET_FOR_EUDR, LANDGRIFFON_ANALYSIS } from './constants';

const DatasetReleases: React.FC = () => (
  <section className="relative bg-white">
    <Wrapper>
      <FadeIn>
        <Intro
          title="DATASET RELEASES:"
          intro="Explore the datasets that are central to our analysis."
        >
          <div className="space-y-6">
            <h4 className="font-bold">{DATASET_FOR_EUDR.title}</h4>
            <ul className="space-y-[5px]">
              {DATASET_FOR_EUDR.datasets.map((dataset) => (
                <li
                  key={dataset.name}
                  className="flex justify-between items-center bg-gray-100 p-[15px] space-x-2"
                >
                  <span className="font-light">{dataset.name}</span>
                  <Link href={dataset.url}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex space-x-5 font-bold items-center"
                    >
                      <span className="underline whitespace-nowrap">Go to source</span>
                      <Icon icon={ARROW_SVG} className="w-3 h-3 fill-black" />
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold">{LANDGRIFFON_ANALYSIS.title}</h4>
            <ul className="space-y-[5px]">
              {LANDGRIFFON_ANALYSIS.datasets.map((dataset) => (
                <li
                  key={dataset.name}
                  className="flex justify-between items-center bg-gray-100 p-[15px] space-x-2"
                >
                  <span className="font-light">{dataset.name}</span>
                  <Link href={dataset.url}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex space-x-5 font-bold items-center"
                    >
                      <span className="underline whitespace-nowrap">Go to source</span>
                      <Icon icon={ARROW_SVG} className="w-3 h-3 fill-black" />
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-12">
            <p className="max-w-xl">
              <span className="font-bold">
                November 2023: Global SBTN-aligned nature accounting datasets to go beyond emissions
                reductions in agricultural supply chains.
              </span>{' '}
              Access datasets via{' '}
              <Link href="https://beta.source.coop/repositories/vizzuality/lg-land-carbon-data/">
                <a target="_blank" rel="noopener noreferrer" className="underline font-light">
                  Source Cooperative. 
                </a>
              </Link>
            </p>
            <p className="font-light">
              Preprocessed data for five indicator areas: Deforestation; Greenhouse gas emissions;
              Loss of natural ecosystems; Biodiversity loss resulting from agricultural production
              according to the Forest Integrity index; Biodiversity loss resulting from agricultural
              production according to the Biodiversity Intactness index. The data is based on
              trusted, high-resolution geospatial data from
              <Link href="https://www.globalforestwatch.org/">
                <a target="_blank" rel="noopener noreferrer" className="underline font-light">
                  {' '}
                  Global Forest Watch
                </a>
              </Link>
              , the{' '}
              <Link href="https://www.wri.org/">
                <a target="_blank" rel="noopener noreferrer" className="underline font-light">
                  {' '}
                  World Resources Institute
                </a>
              </Link>
              ,
              <Link href="https://www.impactobservatory.com/">
                <a target="_blank" rel="noopener noreferrer" className="underline font-light">
                  {' '}
                  Impact Observatory
                </a>
              </Link>
              ,
              <Link href="https://www.esri.com/en-us/home">
                <a target="_blank" rel="noopener noreferrer" className="underline font-light">
                  {' '}
                  ESRI 
                </a>
              </Link>{' '}
              and{' '}
              <Link href="https://www.conservation.org/">
                <a target="_blank" rel="noopener noreferrer" className="underline font-light">
                  Conservation International
                </a>
              </Link>
              , among other credible industry sources, and tailored for companies to measure nature
              impacts and prioritize sustainability actions across agricultural supply chains.
            </p>
          </div>
        </Intro>
      </FadeIn>
    </Wrapper>
  </section>
);

export default DatasetReleases;
