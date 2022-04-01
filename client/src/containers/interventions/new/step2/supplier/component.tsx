import { useMemo, useCallback, useState, FC } from 'react';

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
import { SelectOptions, SelectOption } from 'components/select/types';

const Supplier: FC = () => {
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
        label: locationType,
        value: locationType,
      })),
    [locationTypes],
  );

  const { data: countries } = useAdminRegionsTrees({ depth: 0 });
  const optionsCountries: SelectOptions = useMemo(
    () =>
      countries.map(({ name, id }) => ({
        label: name,
        value: id,
      })),
    [countries],
  );

  const [formData, setFormData] = useState({
    newT1SupplierId: suppliers[0]?.id,
    newProducerId: producers[0]?.id,
    newLocationType: locationTypes[0],
    newLocationCountryInput: countries[0]?.id,
  });

  // const currentSupplier = useMemo<SelectOption>(
  //   () => optionsSuppliers?.find((option) => option.value === formData.newT1SupplierId),
  //   [optionsSuppliers, formData.newT1SupplierId],
  // );

  // const currentProducer = useMemo<SelectOption>(
  //   () => optionsProducers?.find((option) => option.value === formData.newProducerId),
  //   [optionsProducers, formData.newProducerId],
  // );

  // const currentLocationType = useMemo<SelectOption>(
  //   () => optionsLocationTypes?.find((option) => option.value === formData.newLocationType),
  //   [optionsLocationTypes, formData.newLocationType],
  // );

  // const currentCountry = useMemo<SelectOption>(
  //   () => optionsCountries?.find((option) => option.value === formData.newLocationCountryInput),
  //   [optionsCountries, formData.newLocationCountryInput],
  // );

  const isLoadingCountries = false;

  const { register, setValue, watch } = useFormContext();

  const handleDropdown = useCallback(
    (id: string, value: string | string[] | number) => {
      setValue(id, value);
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
              current={watch('newT1SupplierId')}
              options={optionsSuppliers}
              placeholder="Select"
              onChange={({ value }) => handleDropdown('newT1SupplierId', value)}
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
              onChange={({ value }) => handleDropdown('newProducerId', value)}
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
                current={watch('newLocationType')}
                options={optionsLocationTypes}
                placeholder="all LocationTypes"
                onChange={({ value }) => handleDropdown('newLocationType', value)}
              />
            </div>
          </div>

          <div className="block font-medium text-gray-700">
            <span>Country</span>
            <div className="mt-1">
              <Select
                {...register('newLocationCountryInput')}
                loading={isLoadingCountries}
                current={watch('newLocationCountryInput')}
                options={optionsCountries}
                placeholder="All Countries"
                onChange={({ value }) => handleDropdown('newLocationCountryInput', value)}
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
          name="address"
          id="address"
          autoComplete="given-address"
        />
      </fieldset>
    </>
  );
};

export default Supplier;
