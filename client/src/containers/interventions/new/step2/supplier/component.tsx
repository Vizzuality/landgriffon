import { useMemo, useCallback, useState, FC } from 'react';

import Select from 'components/select';

// types
import { SelectOptions, SelectOption } from 'components/select/types';

const Supplier: FC = () => {
  const [landgriffonEstimates, setLandgriffonEstimates] = useState(false);

  const locationTypes = ['location1', 'location2'];
  const locationType = 'location1';
  const countries = ['Spain', 'Portugal'];
  const country = 'Spain';

  const optionsLocationTypes: SelectOptions = useMemo(
    () =>
      locationTypes.map((locationType) => ({
        label: locationType,
        value: locationType,
      })),
    [locationTypes],
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
    [countries],
  );

  const currentCountry = useMemo<SelectOption>(
    () => optionsCountries?.find((option) => option.value === country),
    [optionsCountries],
  );

  const isLoadingLocationType = false;
  const isLoadingCountries = false;

  const onChange = useCallback((key: string, value: string | number) => {
    console.log('onChange filter');
  }, []);

  const handleChange = useCallback(() => {
    setLandgriffonEstimates(!landgriffonEstimates);
  }, []);

  return (
    <>
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
    </>
  );
};

export default Supplier;
