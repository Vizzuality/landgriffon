import { useMemo, useCallback, useState } from 'react';

import Select from 'components/select';

// types
import { SelectOptions, SelectOption } from 'components/select/types';

const Step2 = () => {
  const [landgriffonEstimates, setLandgriffonEstimates] = useState(false);

  const producers = ['prod1', 'prod2'];
  const producer = 'prod1';
  const locationTypes = ['location1', 'location2'];
  const locationType = 'location1';
  const countries = ['Spain', 'Portugal'];
  const country = 'Spain';

  const optionsProducers: SelectOptions = useMemo(
    () => producers.map((producer) => ({
      label: producer,
      value: producer,
    })), [producers]);

  const currentProducer = useMemo<SelectOption>(
    () => optionsProducers?.find((option) => option.value === producer),
    [optionsProducers]);

  const optionsLocationTypes: SelectOptions = useMemo(
    () => locationTypes.map((locationType) => ({
      label: locationType,
      value: locationType,
    })), [locationTypes]);

  const currentLocationType = useMemo<SelectOption>(
    () => optionsLocationTypes?.find((option) => option.value === locationType),
    [optionsLocationTypes]);

  const optionsCountries: SelectOptions = useMemo(
    () => countries.map((country) => ({
      label: country,
      value: country,
    })), [countries]);

  const currentCountry = useMemo<SelectOption>(
    () => optionsCountries?.find((option) => option.value === country),
    [optionsCountries]);

  const isLoadingProducers = false;
  const isLoadingLocationType = false;
  const isLoadingCountries = false;

  const onChange = useCallback((key: string, value: string | number) => {
    console.log('onChange filter')
  },
    [],
  );

  const handleChange = useCallback(() => {
    setLandgriffonEstimates(!landgriffonEstimates)
  }, []);

  return (
    <>
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="font-medium leading-5">Supplier impacts per tone</legend>
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center">
            <input
              id="landgriffon_estimates"
              name="landgriffon_estimates"
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              onChange={handleChange}
            />
            <label htmlFor="landgriffon_estimates" className="ml-2 block text-sm text-gray-900">
              Use LandGriffon location-based estimates.
            </label>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <label htmlFor="carbon_emissions" className="block font-medium text-gray-700">
            Carbon emissions
            <div className="mt-1">
              <input
                type="text"
                name="carbon_emissions"
                id="carbon_emissions"
                autoComplete="given-emission"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
                disabled={landgriffonEstimates}
              />
            </div>
          </label>

          <label htmlFor="deforestation_risk" className="block font-medium text-gray-700">
            Deforestation risk
            <div className="mt-1">
              <input
                type="text"
                name="deforestation_risk"
                id="deforestation_risk"
                autoComplete="given-risk"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
                disabled={landgriffonEstimates}
              />
            </div>
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <label htmlFor="water_withdrawal" className="block font-medium text-gray-700">
            Water withdrawal
            <div className="mt-1">
              <input
                type="text"
                name="water_withdrawal"
                id="water_withdrawal"
                autoComplete="given-water-withdrawal"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
                disabled={landgriffonEstimates}
              />
            </div>
          </label>

          <label htmlFor="biodiversity_impact" className="block font-medium text-gray-700">
            Biodiversity impact
            <div className="mt-1">
              <input
                type="text"
                name="biodiversity_impact"
                id="biodiversity_impact"
                autoComplete="given-biodiversity-impact"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
                disabled={landgriffonEstimates}
              />
            </div>
          </label>
        </div>
      </fieldset>
    </>
  );
};

export default Step2;
