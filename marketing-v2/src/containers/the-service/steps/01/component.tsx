import cx from 'classnames';

const Step01: React.FC = () => {
  return (
    <article
      className={cx({
        'flex flex-col lg:flex-row justify-between space-y-10 lg:space-x-10 lg:space-y-0': true,
      })}
    >
      <div className="w-full space-y-10">
        <header className="relative">
          <div className="relative z-10 space-y-12">
            <h2 className="text-xl font-black uppercase font-display">Benchmark</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase font-display">
              Your sustainability journey.
            </h3>
          </div>
          <div className="absolute z-0 top-0 right-0 font-display text-[220px] leading-[160px] text-green-400">
            01
          </div>
        </header>

        <div className="space-y-5">
          <p className="text-xl">
            Our sustainability experts and technical team work closely with you to understand your
            sustainability priorities and existing systems. We leverage the capabilities of
            LandGriffon to create your transformation strategy and roadmap.
          </p>
        </div>
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">We are interested in your:</h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              Targets, objectives, materiality and commitments
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              Reporting and compliance requirements
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              Existing usage of environmental datasets, certification
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              Frameworks, reporting guidelines, etc
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              Risk management
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default Step01;
