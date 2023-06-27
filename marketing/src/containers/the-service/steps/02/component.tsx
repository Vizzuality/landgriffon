import Link from 'next/link';

import cx from 'classnames';
import Image from 'next/image';

import Icon from 'components/icon';

import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';

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
          <p className="text-2xl font-bold">
            LandGriffon works with all levels of sourcing precision.
          </p>
          <p className="text-xl">
            For example, if you source from intermediate suppliers rather than having farm and field
            locations, it uses a probabilistic model to estimate where your materials are most
            likely produced.{' '}
            <b>
              No matter your level of sourcing data we work with you to map what you can and fill
              the gaps where needed.
            </b>
          </p>

          <Link href="/methodology">
            <a className="flex items-center space-x-5">
              <span className="font-semibold underline">Find out how our sourcing model works</span>
              <Icon icon={ARROW_RIGHT_SVG} className="w-12 h-12" />
            </a>
          </Link>
        </div>
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">Import data into LandGriffon:</h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Minimum:</p>
              <p>Materials & volumes</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Improved accuracy:</p>
              <p>
                Suppliers, producers, farm/mill/silo locations, certifications, or commodity- and
                supplier-specific data.
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Extensive: </p>
              <p>Other value chain impact data from supplier surveys and traceability tools.</p>
            </li>
          </ul>
          <div className="w-full border-2 border-white">
            <Image
              width={1960}
              height={886}
              layout="responsive"
              src="/images/service/steps/step_2.png"
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
