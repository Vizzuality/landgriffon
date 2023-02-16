import Image from 'next/image';
import { useCallback, useMemo } from 'react';

import SatelliteImage from './images/satellite1.png';
import DefaultImage from './images/default1.png';

import Tooltip from 'components/tooltip';

import type { BasemapValue } from './types';
interface BasemapControlProps {
  value: BasemapValue;
  onChange: (value: BasemapValue) => void;
}

const BasemapControl = ({ value, onChange }: BasemapControlProps) => {
  const basemapToToggleTo = value === 'terrain' ? 'satellite' : 'terrain';

  const handleClick = useCallback(() => {
    onChange(basemapToToggleTo);
  }, [basemapToToggleTo, onChange]);

  const image = value === 'terrain' ? SatelliteImage : DefaultImage;

  const TooltipContent = useMemo(
    () => (
      <div className="p-2 text-xs text-white bg-gray-900 rounded-lg">
        Change to {basemapToToggleTo} basemap
      </div>
    ),
    [basemapToToggleTo],
  );

  return (
    <Tooltip hoverTrigger placement="left" theme="dark" content={TooltipContent}>
      <div
        className="transition-colors duration-200 ease-in-out bg-white border border-white rounded-lg shadow-lg cursor-pointer aspect-square hover:bg-green-50 hover:border-navy-400"
        onClick={handleClick}
      >
        <div className="w-full h-full p-px pointer-events-none">
          <div className="w-full h-full overflow-hidden rounded-md">
            <Image
              width={40}
              height={40}
              src={image}
              alt={`Change to ${basemapToToggleTo} basemap`}
            />
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default BasemapControl;
