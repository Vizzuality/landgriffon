import cx from 'classnames';
import Icon from 'components/icon';
import Image from 'next/image';

import DOWNLOAD_SVG from 'svgs/ui/icn_download.svg?sprite';

const Step02: React.FC = () => {
  return (
    <article
      className={cx({
        'flex flex-col lg:flex-row-reverse justify-between space-y-10 lg:space-x-20 lg:space-x-reverse lg:space-y-0':
          true,
      })}
    >
      <div className="w-full space-y-10">
        <header className="relative">
          <div className="relative z-10 space-y-5">
            <h3 className="font-black md:leading-[100px] uppercase text-7xl md:text-9xl font-display">
              Land use
            </h3>
          </div>
        </header>

        <div className="space-y-5">
          <p className="text-xl">
            Land use impacts result from the conversion of natural ecosystems to productive
            agriculture.
          </p>
          <p className="text-xl">
            As direct attribution of forest loss is difficult to track at large scales, land use
            impacts are measured as an indirect risk of land conversion that occurs within 50 km of
            a supplier aggregation point (e.g. Silo, Mill) or within a weighted 50 km buffer around
            commodity agricultural areas within the jurisdiction you source from.
          </p>
        </div>

        <button
          type="button"
          className="hidden items-center py-8 font-semibold text-white bg-black border border-black px-14 hover:bg-black/75 space-x-2.5"
        >
          <span>Download Methodology</span>

          <Icon icon={DOWNLOAD_SVG} className="w-4 h-4 fill-white" />
        </button>
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <div className="border-2 border-white shadow-2xl">
            <Image
              layout="responsive"
              src="/images/home/what/screen_1.jpg"
              width={966}
              height={433}
              alt="Farm level"
            />
          </div>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Deforestation. </p>
              <p>
                Hectares of forest loss within 50km of sourcing regions scaled by land use impact
                Source: Satelligence, Global Forest Watch, land use
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Biodiversity.</p>
              <p>
                Hectares of high biodiversity habitat converted within 50km of sourcing regions
                Source: WWF, deforestation
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Land carbon.</p>
              <p>
                Tons of carbon associated with forest loss within 50km of sourcing regions Source:
                Satelligence, Global Forest Watch, deforestation
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Future deforestation risk.</p>
              <p>Index of areas likely to be deforested within 50km of sourcing regions</p>
              <p>
                Source: <strong className="font-semibold">Satelligence</strong>
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Custom land use change indicators.</p>
              <p>Add data sources or adjust metrics to better measure your business impacts.</p>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default Step02;
