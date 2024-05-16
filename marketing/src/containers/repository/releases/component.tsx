import Intro from 'containers/repository/intro';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Link from 'next/link';
import Icon from 'components/icon';

import ARROW_SVG from 'svgs/ui/arrow-top-right.svg?sprite';

const LANDGRIFFON_ANALYSIS = {
  title: 'Foundational datasets that underpin LandGriffon analysis:',
  datasets: [
    {
      name: 'Mekonnen and Hoekstra. The green, blue and grey water footprint of crops and derived crop products',
      url: 'https://doi.org/10.5194/hess-15-1577-2011',
    },
    {
      name: 'Kuzma et al. Aqueduct 4.0: Updated decision-relevant global water risk indicators',
      url: 'http://doi.org/10.46830/writn.23.00061',
    },
    {
      name: 'McDowell et al. Global Mapping of Freshwater Nutrient Enrichment and Periphyton Growth Potential',
      url: 'https://doi.org/10.1038/s41598-020-60279-w',
    },
    {
      name: 'McDowell et al. Global Database of Diffuse Riverine Nitrogen and Phosphorus Loads and Yields',
      url: 'https://doi.org/10.1002/gdj3.111',
    },
    {
      name: 'International Food Policy Research Institute. Global Spatially-Disaggregated Crop Production Statistics Data for 2010 Version 2.0',
      url: 'https://doi.org/10.7910/DVN/PRFF8V',
    },
    {
      name: 'Halpern et al. The Environmental Footprint of Global Food Production.',
      url: 'https://doi.org/10.1038/s41893-022-00965-x',
    },
    {
      name: 'Noon et al. Mapping the Irrecoverable Carbon in Earth’s Ecosystems.',
      url: 'https://doi.org/10.1038/s41893-021-00803-6',
    },
    {
      name: 'Hansen et al. High-Resolution Global Maps of 21st-Century Forest Cover Change. ',
      url: 'https://doi.org/10.1126/science.1244693',
    },
    {
      name: 'Mazur et al. SBTN Natural Lands Map: Technical Documentation.',
      url: 'https://sciencebasedtargetsnetwork.org/wp-content/uploads/2023/05/Technical-Guidance-2023-Step3-Land-v0.3-Natural-Lands-Map.pdf',
    },
    {
      name: 'Karra et al. Global Land Use / Land Cover with Sentinel 2 and Deep Learning.',
      url: 'https://doi.org/10.1109/IGARSS47720.2021.9553499',
    },
    {
      name: 'Grantham et al. Anthropogenic Modification of Forests Means Only 40% of Remaining Forests Have High Ecosystem Integrity.',
      url: 'https://doi.org/10.1038/s41467-020-19493-3',
    },
    {
      name: 'Gassert et al. Global 100m Projections of Biodiversity Intactness for the Years 2017 - 2020.',
      url: 'https://ai4edatasetspublicassets.blob.core.windows.net/assets/pdfs/io-biodiversity/Biodiversity_Intactness_whitepaper.pdf',
    },
  ],
};

const DATASET_FOR_EUDR = {
  title: 'Datasets for EUDR:',
  datasets: [
    {
      name: 'Bourgoin et al. Global map of forest cover 2020 - version 1.',
      url: 'http://data.europa.eu/89h/10d1b337-b7d1-4938-a048-686c8185b290',
    },
    {
      name: 'Bourgoin et al. Mapping Global Forest Cover of the Year 2020 to Support the EU Regulation on Deforestation-free Supply Chains.',
      url: 'https://www.researchgate.net/publication/379119723_Mapping_Global_Forest_Cover_of_the_Year_2020_to_Support_the_EU_Regulation_on_Deforestation-free_Supply_Chains',
    },
    {
      name: 'Hansen et al. High-Resolution Global Maps of 21st-Century Forest Cover Change.',
      url: 'https://glad.earthengine.app/view/global-forest-change',
    },
    {
      name: 'Reiche et al. Forest disturbance alerts for the Congo Basin using Sentinel-1.',
      url: 'https://doi.org/10.1088/1748-9326/abd0a8',
    },
    {
      name: 'Adrià et al. High resolution global industrial and smallholder oil palm map for 2019 (Version v1).',
      url: 'https://zenodo.org/records/4473715',
    },
    {
      name: 'Vancutsem et al. Long-term (1990-2019) monitoring of forest cover changes in the humid tropics. ',
      url: 'https://www.science.org/doi/10.1126/sciadv.abe1603',
    },
  ],
};

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
                      <Icon icon={ARROW_SVG} className="w-3 h-3 fil-current" />
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
                      <Icon icon={ARROW_SVG} className="w-3 h-3 fil-current" />
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
