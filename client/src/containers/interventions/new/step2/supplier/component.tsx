import { useMemo, useCallback, FC } from 'react';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/select';

// containers
import InfoTooltip from 'containers/info-tooltip';

// hooks
import { useSuppliersTypes } from 'hooks/suppliers';
import { useLocationTypes } from 'hooks/interventions';
import { useAdminRegionsTrees } from 'hooks/admin-regions';
import { useFormContext } from 'react-hook-form';

// types
import type { SelectOption, SelectOptions } from 'components/select/types';

const Supplier: FC = () => {
  const {
    register,
    setValue,
    watch,
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

  const locationTypes = useLocationTypes();
  const optionsLocationTypes: SelectOptions = useMemo(
    () =>
      locationTypes.map((locationType) => ({
        label: locationType.charAt(0).toUpperCase() + locationType.slice(1),
        value: locationType,
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
      setValue(id, value.value);
    },
    [setValue],
  );

  return (
    <>
      <fieldset className="sm:col-span-3 text-sm mt-8">
        <legend className="flex font-medium leading-5">
          New supplier
          <InfoTooltip className="ml-2" />
        </legend>

        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
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
          Supplier location
          <InfoTooltip className="ml-2" />
        </legend>

        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            <span>Location type</span>
            <div className="mt-1">
              <Select
                {...register('newLocationType')}
                loading={!locationTypes}
                current={selectedLocationTypeOption}
                options={optionsLocationTypes}
                placeholder="all LocationTypes"
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
          {...register('newLocationAddressInput')}
          className="w-full"
          type="text"
          autoComplete="given-address"
          error={errors?.newLocationAddressInput}
          showHint={false}
        />
      </fieldset>
    </>
  );
};

export default Supplier;
