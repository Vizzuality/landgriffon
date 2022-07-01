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
          <div className="relative z-10 space-y-12">
            <h2 className="text-xl font-black uppercase font-display">Calculate</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase font-display">
              YOUR ENVIRONMENTAL IMPACTS.
            </h3>
          </div>
          <div className="absolute z-0 top-0 right-0 font-display text-[220px] leading-[160px] text-orange-400">
            03
          </div>
        </header>

        <div className="space-y-5">
          <p className="text-xl">
            The software measures environmental impacts and risks throughout your supply chain,
            using the most up-to-date and recognised science based indicators. By layering this with
            your procurement data, we build a picture of what environmental impacts are linked to
            your supply chain and where.
          </p>
          <Link href="/methodology">
            <a className="inline-block py-8 font-semibold text-white bg-black border border-black px-14 hover:bg-black/75">
              Learn more about the science behind
            </a>
          </Link>
        </div>
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">
            Indicators used to analyze impact:
          </h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Water:</p>
              <p>Aqueduct, Water Footprint Network</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Cropland & yields:</p>
              <p>MapSPAM, Earthstat</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Forest loss:</p>
              <p>Satelligence, Global Forest Watch</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Biodiversity:</p>
              <p>WWF Eco, IBAT</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Land carbon:</p>
              <p>Satelligence, Global Forest Watch</p>
            </li>
          </ul>
        </div>

        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">
            Additional sources that can be added:
          </h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">On-the-ground LCAs.</p>
              <p>Override LandGriffon estimates.</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Add licensed data</p>
              <p>
                (e.g. NatureMetrics, MapleCroft, Quantis, Geofootprint), your own indicators, or
                custom metrics
              </p>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default Step03;
