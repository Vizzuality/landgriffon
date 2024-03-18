import { useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

import LayersData from '../layers.json';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setBasemap, setPlanetLayer, setPlanetCompareLayer } from '@/store/features/eudr';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import InfoModal from '@/components/legend/item/info-modal';
import DefaultImage from '@/components/map/controls/basemap/images/default1.png';
import SatelliteImage from '@/components/map/controls/basemap/images/satellite1.png';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const monthFormatter = (date: string) => format(date, 'MMM');

const YEARS = [2020, 2021, 2022, 2023, 2024];

const EUDRBasemapControl = () => {
  const currentDate = useMemo(() => new Date(), []);
  const dispatch = useAppDispatch();
  const { basemap, planetLayer, planetCompareLayer } = useAppSelector((state) => state.eudr);
  const basemapData = LayersData.find((layer) => layer.id === 'planet-data');

  const handleLightBasemap = useCallback(
    (checked: boolean) => {
      if (checked) {
        dispatch(setBasemap('light'));
        dispatch(setPlanetLayer({ active: !checked }));
      } else {
        dispatch(setBasemap('planet'));
        dispatch(setPlanetLayer({ active: checked }));
      }
    },
    [dispatch],
  );

  const handlePlanetLayer = useCallback(
    (checked: boolean) => {
      dispatch(setBasemap('planet'));
      dispatch(setPlanetLayer({ active: checked }));
      if (!checked) dispatch(setPlanetCompareLayer({ active: false }));
    },
    [dispatch],
  );

  const handlePlanetLayerYear = useCallback(
    (year: string) => {
      const nextYear = Number(year);
      if (nextYear === currentDate.getFullYear()) {
        // If the year is the current year, set the month to the previous month
        dispatch(setPlanetLayer({ month: currentDate.getMonth() }));
      }
      dispatch(setPlanetLayer({ year: nextYear }));
    },
    [dispatch, currentDate],
  );

  const handlePlanetLayerMonth = useCallback(
    (month: string) => {
      dispatch(setPlanetLayer({ month: Number(month) }));
    },
    [dispatch],
  );

  const handlePlanetCompareLayerYear = useCallback(
    (year: string) => {
      dispatch(setPlanetCompareLayer({ year: Number(year) }));
    },
    [dispatch],
  );

  const handlePlanetCompareLayerMonth = useCallback(
    (month: string) => {
      dispatch(setPlanetCompareLayer({ month: Number(month) }));
    },
    [dispatch],
  );

  const handlePlanetCompareLayer = useCallback(
    (checked: boolean) => {
      dispatch(setPlanetCompareLayer({ active: checked }));
    },
    [dispatch],
  );

  useEffect(() => {
    if (basemap === 'light') {
      dispatch(setPlanetCompareLayer({ active: false }));
    }
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
                    <Switch checked={basemap === 'light'} onCheckedChange={handleLightBasemap} />
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
                      <Switch checked={planetLayer.active} onCheckedChange={handlePlanetLayer} />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Monthly high resolution basemaps (tropics)
                </div>
                {planetLayer.active && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <div>Year</div>
                    <Select
                      defaultValue={planetLayer.year.toString()}
                      value={planetLayer.year.toString()}
                      onValueChange={handlePlanetLayerYear}
                    >
                      <SelectTrigger className="h-auto w-auto rounded-sm border border-navy-400 py-1 pl-2 pr-1 text-xs text-navy-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={`planet-year-option-${year}`} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div>Month</div>
                    <Select
                      defaultValue={planetLayer.month.toString()}
                      value={planetLayer.month.toString()}
                      onValueChange={handlePlanetLayerMonth}
                    >
                      <SelectTrigger className="h-auto w-auto rounded-sm border border-navy-400 py-1 pl-2 pr-1 text-xs text-navy-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                          (month) =>
                            (planetLayer.year < currentDate.getFullYear() ||
                              month <= currentDate.getMonth()) && (
                              <SelectItem
                                key={`planet-year-option-${month}`}
                                value={month.toString()}
                              >
                                {monthFormatter(month.toString())}
                              </SelectItem>
                            ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 text-xs">
          {!planetLayer.active && <div>Select satellite basemap for image comparison option.</div>}
          {planetLayer.active && (
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
                      <Switch
                        checked={planetCompareLayer.active}
                        onCheckedChange={handlePlanetCompareLayer}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Monthly high resolution basemaps (tropics)
                </div>
                {planetCompareLayer.active && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <div>Year</div>
                    <Select
                      defaultValue={planetCompareLayer.year.toString()}
                      value={planetCompareLayer.year.toString()}
                      onValueChange={handlePlanetCompareLayerYear}
                    >
                      <SelectTrigger className="h-auto w-auto rounded-sm border border-navy-400 py-1 pl-2 pr-1 text-xs text-navy-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={`planet-year-option-${year}`} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div>Month</div>
                    <Select
                      defaultValue={planetCompareLayer.month.toString()}
                      value={planetCompareLayer.month.toString()}
                      onValueChange={handlePlanetCompareLayerMonth}
                    >
                      <SelectTrigger className="h-auto w-auto rounded-sm border border-navy-400 py-1 pl-2 pr-1 text-xs text-navy-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                          (month) =>
                            (planetCompareLayer.year < currentDate.getFullYear() ||
                              month <= currentDate.getMonth()) && (
                              <SelectItem
                                key={`planet-year-option-${month}`}
                                value={month.toString()}
                              >
                                {monthFormatter(month.toString())}
                              </SelectItem>
                            ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EUDRBasemapControl;
