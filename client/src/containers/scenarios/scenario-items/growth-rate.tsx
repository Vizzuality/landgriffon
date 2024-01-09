import classNames from 'classnames';

import Pill from 'components/pill/component';

import type { GrowthRateProps } from '../types';

const GrowthRate = ({ display }: GrowthRateProps) => {
  // TO-DO: Fix growth rate of 1.5% meanwhile is implemented in the API */}
  return (
    <div>
      {display === 'grid' && <h3 className="text-xs">Growth rates</h3>}
      <div
        className={classNames({
          'mt-2 flex space-x-4': display === 'grid',
        })}
      >
        <Pill className="bg-orange-50">Entire company +1.5%/yr</Pill>
      </div>
    </div>
  );
};

export default GrowthRate;
