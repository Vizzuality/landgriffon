import { useMemo, useCallback, FC } from 'react';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/select';

// containers
import InfoTooltip from 'containers/info-tooltip';

// hooks
import { useSuppliersTypes } from 'hooks/suppliers';
import { useLocationTypes } from 'hooks/location-types';
import { useAdminRegionsTrees } from 'hooks/admin-regions';
import { useFormContext } from 'react-hook-form';
import { useMetadataInterventionsInfo } from 'hooks/metadata-info';

// types
import type { SelectOption, SelectOptions } from 'components/select/types';

const Supplier: FC = () => {
  const {
    register,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliersTypes({
    type: 't1supplier',
  });
  const optionsSuppliers: SelectOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      })),
    [suppliers],
  );

  const { data: producers, isLoading: isLoadingProducers } = useSuppliersTypes({
    type: 'producer',
  });
  const optionsProducers: SelectOptions = useMemo(
    () =>
      producers.map((producer) => ({
        label: producer.name,
        value: producer.id,
      })),
    [producers],
  );

  const { data: locationTypes } = useLocationTypes({});

  const optionsLocationTypes: SelectOptions = useMemo(
    () =>
      locationTypes.map(({ label, value }) => ({
        label,
        value,
      })),
    [locationTypes],
  );
  const currentLocationType = watch('newLocationType');
  const selectedLocationTypeOption = useMemo(
    () => optionsLocationTypes.find(({ value }) => value === currentLocationType),
    [currentLocationType, optionsLocationTypes],
  );

  const { data: countries, isLoading: isLoadingCountries } = useAdminRegionsTrees({ depth: 0 });
  const optionsCountries: SelectOptions = useMemo(
    () =>
      countries.map(({ name, id }) => ({
        label: name,
        value: id,
      })),
    [countries],
  );

  const handleDropdown = useCallback(
    (id: string, value: SelectOption) => {
      clearErrors(id);
      setValue(id, value?.value);
    },
    [setValue, clearErrors],
  );

  const handleOnChange = useCallback(
    (e) => {
      clearErrors(e.currentTarget.name);
    },
    [clearErrors],
  );

  // just these types of location need the extra input for location
  // for the rest of them is enough eith the country
  const isLocationInputEnabled = useMemo(
    () =>
      selectedLocationTypeOption?.value === 'point-of-production' ||
      selectedLocationTypeOption?.value === 'aggregation-point',
    [selectedLocationTypeOption],
  );

  const { supplier, location } = useMetadataInterventionsInfo();

  return (
    <>
      <fieldset className="sm:col-span-3 text-sm mt-8">
        <legend className="flex font-medium leading-5">
          <span className="mr-2.5">New supplier</span>
          <InfoTooltip info={supplier} />
        </legend>

        <div className="mt-5 grid grid-cols-2 gap-y-4 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            <Label className="mb-1">
              Tier 1 supplier <span className="text-gray-500">(optional)</span>
            </Label>
            <Select
              {...register('newT1SupplierId')}
              loading={isLoadingSuppliers}
              current={optionsSuppliers.find((option) => option.value === watch('newT1SupplierId'))}
              options={optionsSuppliers}
              placeholder="Select"
              onChange={(value) => handleDropdown('newT1SupplierId', value)}
              error={!!errors?.newT1SupplierId}
              allowEmpty
            />
          </div>

          <div className="block font-medium text-gray-700">
            <Label className="mb-1">
              Producer <span className="text-gray-500">(optional)</span>
            </Label>
            <Select
              {...register('newProducerId')}
              loading={isLoadingProducers}
              current={watch('newProducerId')}
              options={optionsProducers}
              placeholder="Select"
              onChange={(value) => handleDropdown('newProducerId', value)}
              error={!!errors?.newProducerId}
              allowEmpty
            />
          </div>
        </div>
      </fieldset>
      <fieldset className="sm:col-span-3 text-sm mt-8">
        <legend className="flex font-medium leading-5">
          <span className="mr-2.5">Supplier location</span>
          <InfoTooltip info={location} />
        </legend>

        <div className="mt-5 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            <span>Location type</span>
            <div className="mt-1">
              <Select
                {...register('newLocationType')}
                loading={!locationTypes}
                current={selectedLocationTypeOption}
                options={optionsLocationTypes}
                placeholder="All location types"
                onChange={(value) => handleDropdown('newLocationType', value)}
                error={!!errors?.newLocationType}
                allowEmpty
              />
            </div>
          </div>

          <div className="block font-medium text-gray-700">
            <span>Country</span>
            <div className="mt-1">
              <Select
                {...register('newLocationCountryInput')}
                loading={isLoadingCountries}
                current={optionsCountries.find(
                  (option) => option.value === watch('newLocationCountryInput'),
                )}
                options={optionsCountries}
                placeholder="All Countries"
                onChange={(value) => handleDropdown('newLocationCountryInput', value)}
                error={!!errors?.newLocationCountryInput}
                allowEmpty
              />
            </div>
          </div>
        </div>

        <Label htmlFor="address" className="mt-4">
          City / Address / Coordinates
        </Label>
        <Input
          {...register('newLocationInput')}
          className="w-full"
          type="text"
          autoComplete="given-address"
          placeholder="Insert city, address or coordinates (lat, lon)"
          disabled={!isLocationInputEnabled}
          onChange={handleOnChange}
          error={errors?.newLocationInput?.message}
        />
      </fieldset>
    </>
  );
};

export default Supplier;
