import Tooltip from 'components/tooltip';
import Image from 'next/image';
import { useCallback } from 'react';

import SatelliteImage from './images/satellite1.png';
import DefaultImage from './images/default1.png';
import { BasemapValue } from './types';
interface BasemapControlProps {
  value: BasemapValue;
  onChange: (value: BasemapValue) => void;
}

const BasemapControl: React.FC<BasemapControlProps> = ({ value, onChange }) => {
  const basemapToToggleTo = value === 'terrain' ? 'satellite' : 'terrain';

  const handleClick = useCallback(() => {
    onChange(basemapToToggleTo);
  }, [basemapToToggleTo, onChange]);

  const image = value === 'terrain' ? SatelliteImage : DefaultImage;

  return (
    <Tooltip
      hoverTrigger
      placement="left"
      theme="dark"
      content={
        <div className="bg-gray-900 text-white rounded-lg p-2">
          Change basemap to {basemapToToggleTo}
        </div>
      }
    >
      <div
        className="bg-white cursor-pointer aspect-square shadow-lg rounded-lg transition-colors duration-200 ease-in-out border-white border hover:border-black"
        onClick={handleClick}
      >
        <div className="p-0.5 w-full h-full pointer-events-none">
          <div className="w-full h-full rounded-md overflow-hidden">
            <Image src={image} alt={`Change basemap to ${basemapToToggleTo}`} />
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default BasemapControl;
