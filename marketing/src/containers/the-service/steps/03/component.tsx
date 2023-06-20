import cx from 'classnames';
import Link from 'next/link';

const Step03: React.FC = () => {
  return (
    <article
      className={cx({
        'flex flex-col lg:flex-row-reverse justify-between space-y-10 lg:space-x-10 lg:space-x-reverse lg:space-y-0':
          true,
      })}
    >
      <div className="w-full space-y-10">
        <header className="relative">
          <div className="relative z-10 space-y-5 md:space-y-12">
            <h2 className="text-xl font-black uppercase font-display">Calculate</h2>
            <h3 className="text-4xl font-black uppercase md:text-6xl font-display">
              YOUR ENVIRONMENTAL IMPACTS.
            </h3>
          </div>
          <div className="absolute z-0 top-0 right-0 font-display text-[220px] leading-[160px] text-orange-400">
            03
          </div>
        </header>

        <div className="space-y-5">
          <p className="text-xl">
            The software measures environmental impacts and risks from agricultural production using
            trusted GIS data sources and an open scientific methodology. By layering this with your
            procurement data, we build a centralized picture of what environmental impacts are
            linked to your supply chain and where.
          </p>
          <Link href="/methodology">
            <a className="inline-block py-8 font-semibold text-center text-white bg-black border border-black px-14 hover:bg-black/75">
              Learn more about the LandGriffon methodology
            </a>
          </Link>
        </div>
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">
            Base indicators used to analyze impact:
          </h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Water:</p>
              <p>
                <a
                  href="https://resourcewatch.org/data/explore/wat050-Aqueduct-Baseline-Water-Stress?section=Discover&selectedCollection=&zoom=3&lat=0&lng=0&pitch=0&bearing=0&basemap=dark&labels=light&layers=%255B%257B%2522dataset%2522%253A%2522c66d7f3a-d1a8-488f-af8b-302b0f2c3840%2522%252C%2522opacity%2522%253A1%252C%2522layer%2522%253A%2522fdf06d8c-72e9-48a7-80f1-27bd5f19342c%2522%257D%255D&aoi=&page=1&sort=most-viewed&sortDirection=-1"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  Aqueduct
                </a>
                ,{' '}
                <a
                  href="https://waterfootprint.org/en/resources/waterstat/product-water-footprint-statistics/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  Water Footprint Network
                </a>
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Cropland & yields:</p>
              <p>
                <a
                  href="https://www.mapspam.info/data/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  MapSPAM
                </a>
                ,{' '}
                <a
                  href="http://www.earthstat.org/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  Earthstat
                </a>
                ,{' '}
                <a
                  href="https://www.fao.org/faostat/en/#home"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  FAOSTAT
                </a>
                ,{' '}
                <a
                  href="https://www.fao.org/land-water/land/land-governance/land-resources-planning-toolbox/category/details/en/c/1236449/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  Gridded Livestock of The World
                </a>
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Forest loss & Land Carbon:</p>

              <p>
                <a
                  href="https://land.copernicus.eu/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  Copernicus
                </a>
                ,{' '}
                <a
                  href="https://satelligence.com/solutions"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  Satelligence
                </a>
                ,{' '}
                <a
                  href="https://www.globalforestwatch.org/map/?map=eyJkYXRhc2V0cyI6W3siZGF0YXNldCI6InRyZWUtY292ZXItbG9zcyIsIm9wYWNpdHkiOjEsInZpc2liaWxpdHkiOnRydWUsImxheWVycyI6WyJ0cmVlLWNvdmVyLWxvc3MiXX0seyJkYXRhc2V0IjoicG9saXRpY2FsLWJvdW5kYXJpZXMiLCJsYXllcnMiOlsiZGlzcHV0ZWQtcG9saXRpY2FsLWJvdW5kYXJpZXMiLCJwb2xpdGljYWwtYm91bmRhcmllcyJdLCJvcGFjaXR5IjoxLCJ2aXNpYmlsaXR5Ijp0cnVlfV19&mapMenu=eyJtZW51U2VjdGlvbiI6ImRhdGFzZXRzIiwiZGF0YXNldENhdGVnb3J5IjoiZm9yZXN0Q2hhbmdlIn0%3D"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  Global Forest Watch
                </a>
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Biodiversity:</p>
              <p>
                <a
                  href="https://www.worldwildlife.org/pages/conservation-science-data-and-tools"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  WWF Eco
                </a>
                ,{' '}
                <a
                  href="https://www.ibat-alliance.org/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  IBAT
                </a>
              </p>
            </li>
          </ul>
        </div>

        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">
            Add indicators and data sources:
          </h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">On-the-ground LCAs.</p>
              <p>Override LandGriffon estimates.</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Custom environmental, social, and financial metrics:</p>
              <p>Bring your own indicators, proprietary data sources, or any other data.</p>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default Step03;
