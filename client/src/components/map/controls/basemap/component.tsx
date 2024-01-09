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
      <div className="rounded-lg bg-gray-900 p-2 text-xs text-white">
        Change to {basemapToToggleTo} basemap
      </div>
    ),
    [basemapToToggleTo],
  );

  return (
    <Tooltip hoverTrigger placement="left" theme="dark" content={TooltipContent}>
      <div
        className="aspect-square cursor-pointer rounded-lg border border-white bg-white shadow-lg transition-colors duration-200 ease-in-out hover:border-navy-400 hover:bg-green-50"
        onClick={handleClick}
      >
        <div className="pointer-events-none h-full w-full p-px">
          <div className="h-full w-full overflow-hidden rounded-md">
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
