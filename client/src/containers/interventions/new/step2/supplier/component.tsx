import { useMemo, useCallback, useState, FC } from 'react';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/select';

// containers
import InfoTooltip from 'containers/info-tooltip';

// hooks
import { useSuppliers } from 'hooks/suppliers';

// form validation
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// types
import { SelectOptions, SelectOption } from 'components/select/types';

const producers = ['producer1', 'producer2'];
const producer = 'producer1';
const locationTypes = ['location1', 'location2'];
const locationType = 'location1';
const countries = ['Spain', 'Portugal'];
const country = 'Spain';

const schemaValidation = yup.object({
  supplier: yup.string().required(),
  producer: yup.string().required(),
  locationType: yup.string().required(),
  country: yup.string().required(),
  address: yup.string().required(),
});

const Supplier: FC = () => {
  const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliers();

  const [formData, setFormData] = useState({
    supplier: suppliers[0]?.id,
    producer: producers[0], //?.id,
    locationType: locationTypes[0], //.?id,
    countries: countries[0], //.?id,
  });

  const optionsSuppliers: SelectOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      })),
    [suppliers],
  );

  const currentSupplier = useMemo<SelectOption>(
    () => optionsSuppliers?.find((option) => option.value === formData.supplier),
    [optionsSuppliers, formData.supplier],
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

  // const onChange = useCallback(
  //   (key: string, value: string | number) =>
  //     setFormData({
  //       ...formData,
  //       [key]: value,
  //     }),
  //   [],
  // );

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
  const isLoadingProducers = false;
  const isLoadingLocationType = false;
  const isLoadingCountries = false;

  const {
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
    mode: 'onChange',
  });

  return (
    <>
      <fieldset className="sm:col-span-3 text-sm">
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
              {...register('supplier')}
              loading={isLoadingSuppliers}
              current={currentSupplier}
              options={optionsSuppliers}
              placeholder="Select"
            />
          </div>

          <div className="block font-medium text-gray-700">
            <Label className="mb-1">
              Producer <span className="text-gray-500">(optional)</span>
            </Label>
            <Select
              // id="producer"
              {...register('producer')}
              loading={isLoadingProducers}
              current={currentProducer}
              options={optionsProducers}
              placeholder="Select"
            />
          </div>
        </div>
      </fieldset>
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="flex font-medium leading-5">
          Supplier location
          <InfoTooltip className="ml-2" />
        </legend>

        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            <span>Location type</span>
            <div className="mt-1">
              <Select
                id="locationType"
                {...register('locationType', { value: formData.locationType })}
                loading={isLoadingLocationType}
                current={currentLocationType}
                options={optionsLocationTypes}
                placeholder="all LocationTypes"
                onChange={onChange}
              />
            </div>
          </div>

          <div className="block font-medium text-gray-700">
            <span>Country</span>
            <div className="mt-1">
              <Select
                id="country"
                {...register('country', { value: formData.country })}
                loading={isLoadingCountries}
                current={currentCountry}
                options={optionsCountries}
                placeholder="All Countries"
                onChange={onChange}
              />
            </div>
          </div>
        </div>

        <Label htmlFor="address" className="mt-4">
          City / Address / Coordinates
        </Label>
        <Input
          {...register('address')}
          id="address"
          className="w-full"
          type="text"
          name="address"
          autoComplete="given-address"
        />
      </fieldset>
    </>
  );
};

export default Supplier;
