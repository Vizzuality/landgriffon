import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { RadioGroup, Disclosure } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { PlusIcon, MinusIcon } from '@heroicons/react/solid';
import * as yup from 'yup';
import classNames from 'classnames';
import { sortBy } from 'lodash';

import { useSuppliersTypes } from 'hooks/suppliers';
import { useLocationTypes } from 'hooks/location-types';
import { useAdminRegionsTrees } from 'hooks/admin-regions';
import MaterialsSelect from 'containers/materials/select';
import BusinessUnitsSelect from 'containers/business-units/select';
import LocationsSelect from 'containers/locations/select';
import SuppliersSelect from 'containers/suppliers/select';
import Input from 'components/forms/input';
import { AnchorLink, Button } from 'components/button';
import Select from 'components/select';

import InterventionTypeIcon from './intervention-type-icon';
import { InterventionTypes, LocationTypes } from '../enums';

import type { SelectOptions } from 'components/select/types';
import type { Intervention } from '../types';

type InterventionFormProps = {
  isSubmitting?: boolean;
  onSubmit?: (scenario: Intervention) => void;
};

// const addressRegExp = /(\d{1,}) [a-zA-Z0-9\s]+(\.)? [a-zA-Z]+(\,)? [A-Z]{2} [0-9]{5,6}/;
// const coordinatesRegExp = /^[-]?\d+[\.]?\d*, [-]?\d+[\.]?\d*$/;
// const cityRegExp = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;

const optionSchema = yup.object({
  value: yup.string(),
  label: yup.string(),
});

const schemaValidation = yup.object({
  interventionType: yup.string().required(),
  startYear: optionSchema.required(),
  percentage: yup.number().required(),
  scenarioId: yup.string().required(),

  // Filters
  materialIds: yup.array().of(optionSchema).required(),
  businessUnitIds: yup.array().of(optionSchema),
  supplierIds: yup.array().of(optionSchema),
  adminRegionIds: yup.array().of(optionSchema).required(),

  // Supplier
  newT1Supplier: optionSchema,
  newProducerId: optionSchema,

  // Location
  newLocationType: optionSchema,
  newLocationCountryInput: optionSchema,
  newLocationAddressInput: yup.string(),
  newLocationLatitude: yup.number().min(-90).max(90),
  newLocationLongitude: yup.number().min(180).max(-180),

  // Material
  newMaterialId: optionSchema,

  // Coefficients
  DF_LUC_T: yup.number(),
  UWU_T: yup.number(),
  BL_LUC_T: yup.number(),
  GHG_LUC_T: yup.number(),
});

const LABEL_CLASSNAMES = 'text-sm';

const TYPES_OF_INTERVENTIONS = Object.values(InterventionTypes).map((interventionType) => ({
  value: interventionType,
  label: interventionType,
}));

const InterventionForm: React.FC<InterventionFormProps> = ({ isSubmitting, onSubmit }) => {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    resetField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const currentMaterialIds = watch('materialIds');
  const currentBusinessUnitIds = watch('businessUnitIds');
  const currentLocationIds = watch('adminRegionIds');
  const currentSupplierIds = watch('supplierIds');
  const currentInterventionType = watch('interventionType');
  const locationType = watch('newLocationType');

  // Suppliers
  const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliersTypes({
    type: 't1supplier',
  });
  const optionsSuppliers = useMemo<SelectOptions>(
    () =>
      suppliers.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      })),
    [suppliers],
  );

  // Producers
  const { data: producers, isLoading: isLoadingProducers } = useSuppliersTypes({
    type: 'producer',
  });
  const optionsProducers = useMemo<SelectOptions>(
    () =>
      producers.map((producer) => ({
        label: producer.name,
        value: producer.id,
      })),
    [producers],
  );

  // Location types
  const { data: locationTypes } = useLocationTypes({});
  const optionsLocationTypes: SelectOptions = useMemo(
    () =>
      locationTypes.map(({ label, value }) => ({
        label,
        value,
      })),
    [locationTypes],
  );

  // Countries
  const { data: countries, isLoading: isLoadingCountries } = useAdminRegionsTrees({ depth: 0 });
  const optionsCountries: SelectOptions = useMemo(
    () =>
      sortBy(
        countries.map(({ name, id }) => ({
          label: name,
          value: id,
        })),
        'label',
      ),
    [countries],
  );

  // Years
  const optionsYears = [
    { label: '2019', value: 2019 },
    { label: '2020', value: 2020 },
  ];

  useEffect(() => {
    if (currentInterventionType === InterventionTypes.SupplierLocation) {
      ['newMaterialId', 'newMaterialTonnageRatio'].forEach((field) => resetField(field));
    } else if (currentInterventionType === InterventionTypes.Efficiency) {
      [
        'newMaterialId',
        'newMaterialTonnageRatio',
        'newSupplierId',
        'newProducerId',
        'newLocationType',
        'newLocationCountryInput',
        'newLocationAddressInput',
        'newLocationLatitude',
        'newLocationLongitude',
      ].forEach((field) => resetField(field));
    }
  }, [currentInterventionType, resetField]);

  console.log('errors: ', errors);
  console.log('values: ', getValues());

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6 space-y-10">
      <div className="flex flex-col justify-center pr-10">
        <h2>1. Apply intervention to...</h2>
        <p className="text-sm text-gray-500">
          Choose to which data of your supply chain you want to apply the intervention in order to
          analyze changes.
        </p>
      </div>
      <div className="space-y-4 border-gray-100 border-l-2 pl-10">
        <div>
          <label className={LABEL_CLASSNAMES}>
            Percentage <sup>*</sup>
          </label>
          <Input
            {...register('percentage')}
            type="number"
            min="0"
            max="100"
            placeholder="100"
            defaultValue={100}
          />
        </div>
        <div>
          <label className={LABEL_CLASSNAMES}>
            Raw material <sup>*</sup>
          </label>
          <Controller
            name="materialIds"
            control={control}
            render={({ field }) => (
              <MaterialsSelect
                {...field}
                multiple={false}
                withSourcingLocations
                current={field.value}
                businessUnitIds={currentBusinessUnitIds?.map(({ value }) => value)}
                supplierIds={currentSupplierIds?.map(({ value }) => value)}
                originIds={currentLocationIds?.map(({ value }) => value)}
                onChange={(selected) => setValue('materialIds', selected && [selected])}
                error={!!errors?.materialIds?.message}
              />
            )}
          />
        </div>
        <div>
          <label className={LABEL_CLASSNAMES}>Business Units</label>
          <Controller
            name="businessUnitIds"
            control={control}
            render={({ field }) => (
              <BusinessUnitsSelect
                {...field}
                multiple
                materialIds={currentMaterialIds?.map(({ value }) => value)}
                supplierIds={currentSupplierIds?.map(({ value }) => value)}
                originIds={currentLocationIds?.map(({ value }) => value)}
                withSourcingLocations
                current={field.value}
                onChange={(selected) => setValue('businessUnitIds', selected ?? [])}
                error={!!errors?.businessUnitIds?.message}
              />
            )}
          />
        </div>
        <div>
          <label className={LABEL_CLASSNAMES}>Region</label>
          <Controller
            name="adminRegionIds"
            control={control}
            render={({ field }) => (
              <LocationsSelect
                {...field}
                multiple
                materialIds={currentMaterialIds?.map(({ value }) => value)}
                supplierIds={currentSupplierIds?.map(({ value }) => value)}
                businessUnitIds={currentBusinessUnitIds?.map(({ value }) => value)}
                withSourcingLocations
                current={field.value}
                onChange={(selected) => setValue('adminRegionIds', selected ?? [])}
                error={!!errors?.adminRegionIds?.message}
              />
            )}
          />
        </div>
        <div>
          <label className={LABEL_CLASSNAMES}>Suppliers</label>
          <Controller
            name="supplierIds"
            control={control}
            render={({ field }) => (
              <SuppliersSelect
                {...field}
                multiple
                materialIds={currentMaterialIds?.map(({ value }) => value)}
                businessUnitIds={currentBusinessUnitIds?.map(({ value }) => value)}
                originIds={currentLocationIds?.map(({ value }) => value)}
                withSourcingLocations
                current={field.value}
                onChange={(selected) => setValue('supplierIds', selected ?? [])}
                error={!!errors?.supplierIds?.message}
              />
            )}
          />
        </div>
        <div>
          <label className={LABEL_CLASSNAMES}>
            Year of implementation <sup>*</sup>
          </label>
          <Controller
            name="startYear"
            control={control}
            defaultValue={optionsYears[0]}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                current={field.value}
                options={optionsYears}
                placeholder="Select a year"
                onChange={(value) => setValue('startYear', value)}
                error={!!errors?.startYear?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="flex flex-col justify-center pr-10">
        <h2>2. Type of intervention</h2>
      </div>
      <div className="border-gray-100 border-l-2 pl-10">
        <Controller
          name="interventionType"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field} onChange={(value) => setValue('interventionType', value)}>
              <RadioGroup.Label className="sr-only">Type of intervention</RadioGroup.Label>
              <div className="space-y-4">
                {TYPES_OF_INTERVENTIONS.map(({ label, value }) => (
                  <RadioGroup.Option
                    value={value}
                    key={value}
                    className={({ active, checked }) =>
                      classNames(
                        'border p-4 rounded-md',
                        active || checked
                          ? 'border-yellow bg-yellow text-gray-900'
                          : 'border-gray-300 text-gray-500',
                      )
                    }
                  >
                    {({ active, checked }) => (
                      <div className="flex space-x-4 items-center">
                        <InterventionTypeIcon
                          interventionType={value}
                          variant={active || checked ? 'light' : 'default'}
                        />
                        <RadioGroup.Label>{label}</RadioGroup.Label>
                      </div>
                    )}
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          )}
        />
      </div>

      {currentInterventionType && (
        <>
          <div className="flex flex-col justify-center pr-10">
            <h2>3. Set up intervention</h2>
            <p className="text-sm text-gray-500">
              Select the new material you want to switch to and also the supplier, location or
              impact if you want.
            </p>
          </div>
          {/* Those options depending on intervention type selected by the user */}

          <div className="space-y-10 border-gray-100 border-l-2 pl-10">
            {currentInterventionType === InterventionTypes.Material && (
              <div className="space-y-4">
                <h3>New material</h3>
                <div>
                  <label className={LABEL_CLASSNAMES}>
                    New material <sup>*</sup>
                  </label>
                  <Controller
                    name="newMaterialId"
                    control={control}
                    render={({ field }) => (
                      <MaterialsSelect
                        {...field}
                        multiple={false}
                        current={field.value}
                        onChange={(selected) => setValue('newMaterialId', selected && [selected])}
                        error={!!errors?.newMaterialId?.message}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {(currentInterventionType === InterventionTypes.Material ||
              currentInterventionType === InterventionTypes.SupplierLocation) && (
              <Disclosure as="div" className="space-y-4">
                {({ open }) => (
                  <>
                    <div className="flex justify-between items-center w-full">
                      <h3>New location</h3>
                      <Disclosure.Button
                        className={classNames(
                          'border-primary border w-6 h-6 rounded flex items-center justify-center',
                          open ? 'bg-primary' : 'bg-transparent',
                          {
                            hidden:
                              currentInterventionType === InterventionTypes.Material ||
                              currentInterventionType === InterventionTypes.SupplierLocation,
                          },
                        )}
                      >
                        {open ? (
                          <MinusIcon className="w-5 h-5 text-white" />
                        ) : (
                          <PlusIcon className="w-5 h-5 text-primary" />
                        )}
                      </Disclosure.Button>
                    </div>
                    <Disclosure.Panel
                      static={
                        currentInterventionType === InterventionTypes.SupplierLocation ||
                        currentInterventionType === InterventionTypes.Material
                      }
                    >
                      <div className="space-y-4">
                        <div>
                          <label className={LABEL_CLASSNAMES}>
                            Location type <sup>*</sup>
                          </label>
                          <Controller
                            name="newLocationType"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                showSearch
                                loading={isLoadingProducers}
                                current={field.value}
                                options={optionsLocationTypes}
                                placeholder="Select"
                                onChange={(value) => setValue('newLocationType', value)}
                                error={!!errors?.newLocationType?.message}
                              />
                            )}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLASSNAMES}>
                            Country <sup>*</sup>
                          </label>
                          <Controller
                            name="newLocationCountryInput"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                showSearch
                                loading={isLoadingCountries}
                                current={field.value}
                                options={optionsCountries}
                                placeholder="Select"
                                onChange={(value) => setValue('newLocationCountryInput', value)}
                                error={!!errors?.newLocationCountryInput?.message}
                              />
                            )}
                          />
                        </div>
                        {locationType?.value === LocationTypes.aggregationPoint && (
                          <div>
                            <label className={LABEL_CLASSNAMES}>City / address</label>
                            <Input type="text" {...register('newLocationAddressInput')} />
                          </div>
                        )}
                        {locationType?.value === LocationTypes.aggregationPoint && (
                          <div>
                            <label className={LABEL_CLASSNAMES}>Coordinates</label>
                            <div className="flex space-x-2 w-full">
                              <Input
                                {...register('newLocationLatitude')}
                                type="number"
                                placeholder="Latitude"
                                min={-90}
                                max={90}
                                className="w-full"
                              />
                              <Input
                                {...register('newLocationLongitude')}
                                type="number"
                                placeholder="Longitude"
                                min={-180}
                                max={180}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            )}

            {(currentInterventionType === InterventionTypes.Material ||
              currentInterventionType === InterventionTypes.SupplierLocation) && (
              <Disclosure as="div" className="space-y-4">
                {({ open }) => (
                  <>
                    <div className="flex justify-between items-center w-full">
                      {currentInterventionType === InterventionTypes.Material ? (
                        <div>
                          <h3 className="inline-block">Supplier</h3>{' '}
                          <span className="text-regular text-gray-500">(optional)</span>
                        </div>
                      ) : (
                        <h3>New supplier</h3>
                      )}
                      <Disclosure.Button
                        className={classNames(
                          'border-primary border w-6 h-6 rounded flex items-center justify-center',
                          open ? 'bg-primary' : 'bg-transparent',
                          {
                            hidden: currentInterventionType === InterventionTypes.SupplierLocation,
                          },
                        )}
                      >
                        {open ? (
                          <MinusIcon className="w-5 h-5 text-white" />
                        ) : (
                          <PlusIcon className="w-5 h-5 text-primary" />
                        )}
                      </Disclosure.Button>
                    </div>
                    <Disclosure.Panel
                      static={currentInterventionType === InterventionTypes.SupplierLocation}
                    >
                      <div className="space-y-4">
                        <div>
                          <label className={LABEL_CLASSNAMES}>Tier 1 supplier</label>
                          <Controller
                            name="newSupplierId"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                showSearch
                                loading={isLoadingSuppliers}
                                current={field.value}
                                options={optionsSuppliers}
                                placeholder="Select"
                                onChange={(value) => setValue('newSupplierId', value)}
                                error={!!errors?.newSupplierId?.message}
                                allowEmpty
                              />
                            )}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLASSNAMES}>Producer</label>
                          <Controller
                            name="newProducerId"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                showSearch
                                loading={isLoadingProducers}
                                current={field.value}
                                options={optionsProducers}
                                placeholder="Select"
                                onChange={(value) => setValue('newProducerId', value)}
                                error={!!errors?.newProducerId?.message}
                                allowEmpty
                              />
                            )}
                          />
                        </div>
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            )}

            <Disclosure as="div" className="space-y-4">
              {({ open }) => (
                <>
                  <div className="flex justify-between items-center w-full">
                    {currentInterventionType !== InterventionTypes.Efficiency ? (
                      <div>
                        <h3 className="inline-block">Impacts per ton</h3>{' '}
                        <span className="text-regular text-gray-500">(optional)</span>
                      </div>
                    ) : (
                      <h3>Impacts per ton</h3>
                    )}
                    <Disclosure.Button
                      className={classNames(
                        'border-primary border w-6 h-6 rounded flex items-center justify-center',
                        open ? 'bg-primary' : 'bg-transparent',
                        currentInterventionType === InterventionTypes.Efficiency && 'hidden',
                      )}
                    >
                      {open ? (
                        <MinusIcon className="w-5 h-5 text-white" />
                      ) : (
                        <PlusIcon className="w-5 h-5 text-primary" />
                      )}
                    </Disclosure.Button>
                  </div>
                  <Disclosure.Panel
                    static={currentInterventionType === InterventionTypes.Efficiency}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className={LABEL_CLASSNAMES}>Carbon emission</label>
                        <Input
                          {...register('GHG_LUC_T')}
                          defaultValue={null}
                          type="number"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASSNAMES}>Deforestation risk</label>
                        <Input
                          {...register('DF_LUC_T')}
                          defaultValue={null}
                          type="number"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASSNAMES}>Water withdrawal</label>
                        <Input
                          {...register('UWU_T')}
                          defaultValue={null}
                          type="number"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASSNAMES}>Biodiversity impact</label>
                        <Input
                          {...register('BL_LUC_T')}
                          defaultValue={null}
                          type="number"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        </>
      )}

      <div className="col-span-2">
        <div className="text-sm text-gray-500 text-right mb-6">
          Fields marked with (*) are mandatory.
        </div>
        <div className="flex justify-end space-x-6">
          <Link href="/admin/scenarios" passHref>
            <AnchorLink theme="secondary">Cancel</AnchorLink>
          </Link>
          <Button loading={isSubmitting} type="submit">
            Save intervention
          </Button>
        </div>
      </div>
    </form>
  );
};

export default InterventionForm;
