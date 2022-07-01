import cx from 'classnames';

const Step04: React.FC = () => {
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
            <h2 className="text-xl font-black uppercase font-display">Analyze</h2>
            <h3 className="text-4xl font-black uppercase md:text-6xl font-display">
              To find opportunities for action.
            </h3>
          </div>
          <div className="absolute z-0 top-0 right-0 font-display text-[220px] leading-[160px] text-orange-400">
            04
          </div>
        </header>

        <div className="space-y-5">
          <p className="text-xl">
            Overview your environmental impact over time, retrospectively and using prediction
            modeling. For example, create scenarios through forecasting your growth strategy and
            sustainability decisions. With LandGriffon you can see your complete supply chain and
            find opportunities.
          </p>
        </div>
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">
            Analyze your current supply chain:
          </h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                Identify the largest sources of impact by material, supplier, business unit, or
                other breakdown.
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>Find the greatest opportunities for change.</p>
            </li>
          </ul>
        </div>

        <div className="space-y-10">
          <h4 className="text-2xl border-b border-black pb-2.5">Evaluate your options:</h4>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>Compare scenarios of action and evaluate trade-offs.</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p>
                Model business growth, changes in procurement, material purchases, and the effect of
                on-the-ground activities.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default Step04;
