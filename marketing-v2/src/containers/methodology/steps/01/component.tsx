import cx from 'classnames';
import Image from 'next/image';

const Step01: React.FC = () => {
  return (
    <article
      className={cx({
        'flex flex-col lg:flex-row justify-between space-y-10 lg:space-x-20 lg:space-y-0': true,
      })}
    >
      <div className="w-full space-y-10">
        <header className="relative">
          <div className="relative z-10 space-y-5">
            <h2 className="text-xl font-black uppercase font-display">WHAT WE MEASURE?</h2>
            <h3 className="font-black md:leading-[100px] uppercase text-7xl md:text-9xl font-display">
              FARM LEVEL
            </h3>
          </div>
        </header>

        <div className="space-y-5">
          <p className="text-xl">
            Farm level impacts are direct impacts resulting from the production of agricultural
            products.
          </p>
          <p className="text-xl">
            These impacts are measured by layering environmental indicators with your inputted data,
            whether that is exact producer locations, a weighted map of commodity production, or
            country level sourcing.
          </p>

          <p className="text-xl">
            The accuracy of insights will vary depending on how accurate your inputted data is, but
            for all levels it gives a valuable direction as to where action and attention needs to
            be prioritized.
          </p>
        </div>
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <div className="border-2 border-white shadow-2xl">
            <Image
              layout="responsive"
              src="/images/home/what/screen_4.jpg"
              width={966}
              height={433}
              alt="Farm level"
            />
          </div>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Water use.</p>
              <p>Blue water footprint (water withdrawals) (m3) Source: Water Footprint Network</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Unsustainable water use. </p>
              <p>
                Excess water withdrawals in high water stress regions (m3) Source: Aqueduct, water
                use
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Land use. </p>
              <p>
                Total land used for agricultural production (ha) Source: MapSPAM, EarthStat, FAOSTAT
              </p>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default Step01;
