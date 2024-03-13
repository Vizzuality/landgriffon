import Image from 'next/image';

import DefaultImage from '@/components/map/controls/basemap/images/default1.png';
import SatelliteImage from '@/components/map/controls/basemap/images/satellite1.png';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const EUDRBasemapControl = ({ value, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger>
        <div className="aspect-square cursor-pointer rounded-lg border border-white bg-white shadow-lg transition-colors duration-200 ease-in-out hover:border-navy-400 hover:bg-green-50">
          <div className="pointer-events-none h-full w-full p-px">
            <div className="h-full w-full overflow-hidden rounded-md">
              <Image width={40} height={40} src={SatelliteImage} alt="Change of basemap" />
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" side="left" className="p-0">
        <div className="divide-y">
          <h2 className="px-4 py-2 text-sm font-normal">Basemaps</h2>
          <div>
            <div className="flex space-x-2 p-4">
              <div></div>
              <div>

              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EUDRBasemapControl;
