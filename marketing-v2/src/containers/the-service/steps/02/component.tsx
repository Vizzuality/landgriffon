import cx from 'classnames';
import Image from 'next/image';

const Step02: React.FC = () => {
  return (
    <article
      className={cx({
        'flex flex-col lg:flex-row justify-between space-y-10 lg:space-x-10 lg:space-y-0': true,
      })}
    >
      <div className="w-full space-y-10">
        <header className="relative">
          <div className="relative z-10 space-y-5 md:space-y-12">
            <h2 className="text-xl font-black uppercase font-display">Map</h2>
            <h3 className="text-4xl font-black uppercase md:text-6xl font-display">
              Your supply chain.
            </h3>
          </div>
          <div className="absolute z-0 top-0 right-0 font-display text-[220px] leading-[160px] text-green-400">
            02
          </div>
        </header>

        <div className="space-y-5">
          <p className="text-xl">
            No matter your level of sourcing data we work with you to map what you can, and fill the
            gaps where needed.
          </p>
          <p className="text-xl">
            Our team assists you to gather, process, and import your commodity data to LandGriffon
            and builds a complete picture of your Scope 3 supply chain. It then geolocates this
            procurement data and converts it to GIS data.
          </p>
          <p className="text-xl">
            LandGriffon works with all levels of sourcing precision. For example, if you source from
            an open commodity market rather than having farm and field locations, it uses a
            probabilistic model to estimate where your materials are most likely sourced.
          </p>
        </div>
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">
            We work with all levels of data:
          </h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Minimum:</p>
              <p>materials & volumes</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Improved accuracy:</p>
              <p>
                suppliers, producers, business unit breakdown, farm/mill/silo locations,
                certifications, commodity- and supplier- specific data
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Extensive: </p>
              <p>
                Other value chain impact data from from supplier surveys and traceability tools
                Existing usage of environmental datasets, certification
              </p>
            </li>
          </ul>
          <div className="w-full border-2 border-white">
            <Image
              width={1960}
              height={886}
              layout="responsive"
              src="/images/home/what/screen_1.jpg"
              className="block w-full"
              alt="Data"
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default Step02;
