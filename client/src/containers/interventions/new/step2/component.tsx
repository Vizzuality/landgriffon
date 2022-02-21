import { useMemo, useCallback, useState, FC } from 'react';

// hooks
// import { useIndicators } from 'hooks/indicators';

import Select from 'components/select';

// types
import { SelectOptions, SelectOption } from 'components/select/types';
import { setFilter } from 'store/features/analysis';

const producers = ['prod1', 'prod2'];
const producer = 'prod1';
const locationTypes = ['location1', 'location2'];
const locationType = 'location1';
const countries = ['Spain', 'Portugal'];
const country = 'Spain';

interface Indicator {
  name: string;
  value: number;
  description: string;
  id: string;
  metadata: unknown;
  unit: string;
}

const Step2: FC = () => {
  const [landgriffonEstimates, setLandgriffonEstimates] = useState(false);
  // const { data: indicators, isFetching, isFetched, error } = useIndicators();

  const data = useMemo<Indicator[]>(
    () => [
      {
        description:
          'The different terrestrial ecosystems play an important role storing carbon on the below-ground plant organic matter and soil. Particularly forest, through growth of trees and the increase of soil carbon, contain a large part of the carbon stored on land.\n\nActivities such us land use change or deforestation may affect carbon storage producing a disturbance of the carbon pools that may be released into the atmosphere.\n\nCarbon emissions due to land use change would therefore be the realease of carbon into the atmosphere driven by the change from forest into a specific aggriculture commodity.',
        id: 'c71eb531-2c8e-40d2-ae49-1049543be4d1',
        metadata: {},
        name: 'Carbon emissions',
        value: 0,
        unit: 'tCO2e',
      },
      {
        description: 'Deforestation risk due to ...',
        id: '',
        metadata: {},
        name: 'Deforestation risk',
        value: 0,
        unit: 'Ha',
      },
      {
        description: 'With the Unsustainable water use indicator...',
        id: 'e2c00251-fe31-4330-8c38-604535d795dc',
        metadata: {},
        name: 'Water withdrawal',
        value: 0,
        unit: '100m3',
      },
      {
        description: 'Land use and land use change...',
        id: '0594aba7-70a5-460c-9b58-fc1802d264ea',
        metadata: {},
        name: 'Biodiversity impact',
        value: 0,
        unit: 'X',
      },
    ],
    [],
  );

  const optionsProducers: SelectOptions = useMemo(
    () =>
      producers.map((producer) => ({
        label: producer,
        value: producer,
      })),
    [],
  );

  const currentProducer = useMemo<SelectOption>(
    () => optionsProducers?.find((option) => option.value === producer),
    [optionsProducers],
  );

  const optionsLocationTypes: SelectOptions = useMemo(
    () =>
      locationTypes.map((locationType) => ({
        label: locationType,
        value: locationType,
      })),
    [],
  );

  const currentLocationType = useMemo<SelectOption>(
    () => optionsLocationTypes?.find((option) => option.value === locationType),
    [optionsLocationTypes],
  );

  const optionsCountries: SelectOptions = useMemo(
    () =>
      countries.map((country) => ({
        label: country,
        value: country,
      })),
    [],
  );

  const currentCountry = useMemo<SelectOption>(
    () => optionsCountries?.find((option) => option.value === country),
    [optionsCountries],
  );

  const isLoadingProducers = false;
  const isLoadingLocationType = false;
  const isLoadingCountries = false;

  const onChange = useCallback((key: string, value: number | string) => {
    console.log(key, value);
  }, []);

  const handleChange = useCallback((key: string, value: number) => {
    setFilter({
      id: key,
      value,
    });
  }, []);

  const indicatorsValues = () =>
    data.reduce(
      (obj, indicator) => ({
        ...obj,
        [indicator.name]: indicator.value,
      }),
      {},
    );

  return (
    <>
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="font-medium leading-5">New supplier</legend>

        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            Tier 1 supplier <span className="text-gray-500">(optional)</span>
            <div className="mt-1">
              <Select
                loading={isLoadingProducers}
                current={currentProducer}
                options={optionsProducers}
                placeholder="Select"
                onChange={() => onChange('producer', currentProducer.value)}
              />
            </div>
          </div>

          <div className="block font-medium text-gray-700">
            Producer <span className="text-gray-500">(optional)</span>
            <div className="mt-1">
              <Select
                loading={isLoadingProducers}
                current={currentProducer}
                options={optionsProducers}
                placeholder="Select"
                onChange={() => onChange('producer', currentProducer.value)}
              />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="sm:col-span-3 text-sm">
        <legend className="font-medium leading-5">Supplier location</legend>

        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            <span>Location type</span>
            <div className="mt-1">
              <Select
                loading={isLoadingLocationType}
                current={currentLocationType}
                options={optionsLocationTypes}
                placeholder="all LocationTypes"
                onChange={() => onChange('all', currentLocationType.value)}
              />
            </div>
          </div>

          <div className="block font-medium text-gray-700">
            <span>Country</span>
            <div className="mt-1">
              <Select
                loading={isLoadingCountries}
                current={currentCountry}
                options={optionsCountries}
                placeholder="all Countrys"
                onChange={() => onChange('all_countries', currentCountry.value)}
              />
            </div>
          </div>
        </div>

        <label htmlFor="address" className="mt-4 block font-medium text-gray-700">
          City / Address / Coordinates
          <div className="mt-1">
            <input
              type="text"
              name="address"
              id="address"
              autoComplete="given-address"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
            />
          </div>
        </label>
      </fieldset>

      <fieldset className="sm:col-span-3 text-sm">
        <legend className="font-medium leading-5">Supplier impacts per tone</legend>
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center">
            <input
              id="landgriffon_estimates"
              name="landgriffon_estimates"
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              onChange={() => setLandgriffonEstimates(!landgriffonEstimates)}
            />
            <label htmlFor="landgriffon_estimates" className="ml-2 block text-sm text-gray-900">
              Use LandGriffon location-based estimates.
            </label>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          {data.map((indicator) => (
            <label
              htmlFor={indicator.name}
              key={indicator.id}
              className="block font-medium text-gray-700"
            >
              {indicator.name}
              <div className="mt-1 relative flex items-center">
                <input
                  type="number"
                  name={indicator.name}
                  id={indicator.name}
                  defaultValue={landgriffonEstimates ? indicator.value : ''}
                  value={landgriffonEstimates ? indicator.value : indicatorsValues[indicator.name]}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md text-gray-500"
                  disabled={landgriffonEstimates}
                  onChange={(e) => handleChange(indicator.name, Number(e?.target?.value))}
                />
                <span className="absolute right-2 text-gray-500">{indicator.unit}</span>
              </div>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
};

export default Step2;
