import cx from 'classnames';

const Step05: React.FC = () => {
  return (
    <article
      className={cx({
        'flex flex-col lg:flex-row justify-between space-y-10 lg:space-x-10 lg:space-y-0': true,
      })}
    >
      <div className="w-full space-y-10">
        <header className="relative">
          <div className="relative z-10 space-y-5 md:space-y-12">
            <h2 className="text-xl font-black uppercase font-display">Strategize</h2>
            <h3 className="text-4xl font-black uppercase md:text-6xl font-display">
              FIND THE BEST PATH FORWARD.
            </h3>
          </div>
          <div className="absolute z-0 top-0 right-0 font-display text-[220px] leading-[160px] text-blue-400">
            05
          </div>
        </header>

        <div className="space-y-5">
          <p className="text-xl">
            Forecast interventions and growth scenarios, then see what it takes to reach your
            company&apos;s targets. Prioritize the actions to transform your business for a better
            future.
          </p>
        </div>
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">Suppliers actions.</h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Audit.</strong> Better measure and verify supplier
                activities.
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Engage. </strong> Understand the local context,
                landscape, and community.
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Invest. </strong> Work with key suppliers to
                improve practices.
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Divest. </strong> Remove the worst offenders.
              </p>
            </li>
          </ul>
        </div>

        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">Business actions.</h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Product formula. </strong> Identify lower impact
                alternatives.
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Growth. </strong> Focus on high value to impact
                business lines.
              </p>
            </li>
          </ul>
        </div>

        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">Community actions.</h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                <strong className="font-semibold">Communicate. </strong> Show progress internally
                and externally.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default Step05;
