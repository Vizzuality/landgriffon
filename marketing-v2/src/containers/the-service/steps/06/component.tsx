import cx from 'classnames';

const Step06: React.FC = () => {
  return (
    <article
      className={cx({
        'flex flex-col lg:flex-row justify-between space-y-10 lg:space-x-10 lg:space-y-0': true,
      })}
    >
      <div className="w-full space-y-10">
        <header className="relative">
          <div className="relative z-10 space-y-5 md:space-y-12">
            <h2 className="text-xl font-black uppercase font-display">IMPROVE</h2>
            <h3 className="text-4xl font-black uppercase md:text-6xl font-display">
              Your plans, processes and outcomes.
            </h3>
          </div>
          <div className="absolute z-0 top-0 right-0 font-display text-[220px] leading-[160px] text-blue-400">
            06
          </div>
        </header>

        <div className="space-y-5">
          <p className="text-xl">
            Based on a deeper understanding of your supply chain and the most effective
            opportunities for action, you can improve your environmental impact while continuing to
            evolve for the future.
          </p>
        </div>
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">Improve measurements. </h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Get better data </strong> on your suppliers to
                improve impact measurement.
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Track activities </strong> and show change.
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Add impact and risk metrics </strong> for a more
                holistic view.
              </p>
            </li>
          </ul>
        </div>

        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">
            Streamline or expand the software.
          </h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Automate </strong> processes to speed up analysis.
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Integrate </strong> with internal systems for more
                effective use across your operations
              </p>
            </li>
          </ul>
        </div>

        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">
            Make ambitious but achievable goals.
          </h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>Revise targets and KPIs to match your plan of action</p>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default Step06;
