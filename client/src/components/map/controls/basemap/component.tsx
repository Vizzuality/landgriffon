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
      <div className="bg-gray-900 text-white rounded-lg p-2 text-xs">
        Change to {basemapToToggleTo} basemap
      </div>
    ),
    [basemapToToggleTo],
  );

  return (
    <Tooltip hoverTrigger placement="left" theme="dark" content={TooltipContent}>
      <div
        className="bg-white cursor-pointer aspect-square shadow-lg rounded-lg transition-colors duration-200 ease-in-out border-white border hover:bg-green-50 hover:border-navy-400"
        onClick={handleClick}
      >
        <div className="p-px w-full h-full pointer-events-none">
          <div className="w-full h-full rounded-md overflow-hidden">
            <Image src={image} alt={`Change to ${basemapToToggleTo} basemap`} />
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default BasemapControl;
