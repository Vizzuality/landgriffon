import { useCallback, useEffect } from 'react';
import Image from 'next/image';

import LayersData from '../layers.json';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setBasemap, setPlanetCompare } from '@/store/features/eudr';
import { Switch } from '@/components/ui/switch';
import InfoModal from '@/components/legend/item/info-modal';
import DefaultImage from '@/components/map/controls/basemap/images/default1.png';
import SatelliteImage from '@/components/map/controls/basemap/images/satellite1.png';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import type { EUDRState } from '@/store/features/eudr';

const EUDRBasemapControl = () => {
  const dispatch = useAppDispatch();
  const { basemap, planetCompare } = useAppSelector((state) => state.eudr);
  const basemapData = LayersData.find((layer) => layer.id === 'planet-data');

  const handleBasemap = useCallback(
    (basemapValue: EUDRState['basemap'], checked: boolean) => {
      if (basemapValue === 'light') {
        dispatch(setBasemap(checked ? 'light' : 'planet'));
      } else if (basemapValue === 'planet') {
        dispatch(setBasemap(checked ? 'planet' : 'light'));
      }
    },
    [dispatch],
  );

  const handleSetCompare = useCallback(
    (checked: boolean) => {
      dispatch(setPlanetCompare(checked));
    },
    [dispatch],
  );

  useEffect(() => {
    if (basemap === 'light') dispatch(setPlanetCompare(false));
  }, [basemap, dispatch]);

  return (
    <Popover>
      <PopoverTrigger>
        <div className="aspect-square cursor-pointer rounded-lg border border-white bg-white shadow-lg transition-colors duration-200 ease-in-out hover:border-navy-400 hover:bg-green-50">
          <div className="pointer-events-none h-full w-full p-px">
            <div className="h-full w-full overflow-hidden rounded-md">
              <Image
                width={40}
                height={40}
                src={basemap === 'light' ? DefaultImage : SatelliteImage}
                alt="Change of basemap"
              />
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" side="left" className="p-0">
        <div className="divide-y">
          <h2 className="px-4 py-2 text-sm font-normal">Basemaps</h2>

          <div className="flex items-start space-x-2 p-4">
            <div className="aspect-square shrink-0 cursor-pointer rounded-lg border border-white bg-white shadow-lg transition-colors duration-200 ease-in-out hover:border-navy-400 hover:bg-green-50">
              <div className="pointer-events-none h-full w-full p-px">
                <div className="h-full w-full overflow-hidden rounded-md">
                  <Image width={40} height={40} src={DefaultImage} alt="Change of basemap" />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between">
                <h3 className="text-xs font-semibold">Light Map</h3>
                <div className="flex divide-x">
                  <div className="flex items-center space-x-1 pr-1">
                    <InfoModal
                      info={{
                        title: basemapData.title,
                        description: basemapData.content,
                        source: basemapData.source,
                      }}
                    />
                  </div>
                  <div className="flex items-center pl-1">
                    <Switch
                      checked={basemap === 'light'}
                      onCheckedChange={(checked) => handleBasemap('light', checked)}
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Light basemap version from Carto</div>
            </div>
          </div>

          <div>
            <div className="flex items-start space-x-2 p-4">
              <div className="aspect-square shrink-0 cursor-pointer rounded-lg border border-white bg-white shadow-lg transition-colors duration-200 ease-in-out hover:border-navy-400 hover:bg-green-50">
                <div className="pointer-events-none h-full w-full p-px">
                  <div className="h-full w-full overflow-hidden rounded-md">
                    <Image width={40} height={40} src={SatelliteImage} alt="Change of basemap" />
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <h3 className="text-xs font-semibold">Planet Satellite Imagery</h3>
                  <div className="flex divide-x">
                    <div className="flex items-center space-x-1 pr-1">
                      <InfoModal
                        info={{
                          title: basemapData.title,
                          description: basemapData.content,
                          source: basemapData.source,
                        }}
                      />
                    </div>
                    <div className="flex items-center pl-1">
                      <Switch
                        checked={basemap === 'planet'}
                        onCheckedChange={(checked) => handleBasemap('planet', checked)}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Monthly high resolution basemaps (tropics)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 text-xs">
          {basemap !== 'planet' && <div>Select satellite basemap for image comparison option.</div>}
          {basemap === 'planet' && (
            <div className="flex items-start space-x-2">
              <div className="aspect-square shrink-0 cursor-pointer rounded-lg border border-white bg-white shadow-lg transition-colors duration-200 ease-in-out hover:border-navy-400 hover:bg-green-50">
                <div className="pointer-events-none h-full w-full p-px">
                  <div className="h-full w-full overflow-hidden rounded-md">
                    <Image width={40} height={40} src={SatelliteImage} alt="Change of basemap" />
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <h3 className="text-xs font-semibold">Compare Satellite Images</h3>
                  <div className="flex divide-x">
                    <div className="flex items-center space-x-1 pr-1">
                      <InfoModal
                        info={{
                          title: basemapData.title,
                          description: basemapData.content,
                          source: basemapData.source,
                        }}
                      />
                    </div>
                    <div className="flex items-center pl-1">
                      <Switch checked={planetCompare} onCheckedChange={handleSetCompare} />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Monthly high resolution basemaps (tropics)
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EUDRBasemapControl;
