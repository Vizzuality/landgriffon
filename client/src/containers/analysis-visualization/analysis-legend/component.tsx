import { useCallback, useState } from 'react';
import cx from 'classnames';

import ImpactLegendItem from './impact-legend-item';
import MaterialLegendItem from './material-legend-item';
import RiskLegendItem from './risk-legend-item';

export interface LegendProps {
  className?: string;
}

export const Legend: React.FC<LegendProps> = ({ className = '' }: LegendProps) => {
  const [active, setActive] = useState(false);

  const onToggleActive = useCallback(() => {
    setActive(!active);
  }, [active]);

  return (
    <div
      className={cx(
        'flex flex-col flex-grow shadow-sm bg-white border border-gray-200 rounded',
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="font-semibold text-gray-900 text-sm">Legend</div>
        <button
          type="button"
          aria-expanded={active}
          className="text-green-700 text-xs"
          onClick={onToggleActive}
        >
          <span>{active ? 'Hide' : 'Show'} contextual layers</span>
        </button>
      </div>

      {/* Contextual layers */}
      {active && (
        <div className="relative flex flex-col flex-grow">
          <MaterialLegendItem />
          <RiskLegendItem />
        </div>
      )}

      {/* Main layer: it will be always active */}
      <div
        className="relative flex flex-col flex-grow overflow-hidden border-t border-gray-100"
        style={{
          maxHeight: 400,
        }}
      >
        <div className="overflow-x-hidden overflow-y-auto">
          <ImpactLegendItem />
        </div>
      </div>
    </div>
  );
};

export default Legend;
