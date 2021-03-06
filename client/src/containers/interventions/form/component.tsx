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
import { useSourcingRecordsYears } from 'hooks/sourcing-records';

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
import type { InterventionFormData } from '../types';
import { useRouter } from 'next/router';

type InterventionFormProps = {
  isSubmitting?: boolean;
  onSubmit?: (interventionFormData: InterventionFormData) => void;
};

const optionSchema = yup.object({
  value: yup.string(),
  label: yup.string(),
});

const schemaValidation = yup.object({
  interventionType: yup.string().required(),
  startYear: optionSchema.required(),
  percentage: yup.number().moreThan(0).max(100).required(),
  scenarioId: yup.string().required(),

  // Filters
  materialIds: yup.array().of(optionSchema).required(),
  businessUnitIds: yup.array().of(optionSchema),
  supplierIds: yup.array().of(optionSchema),
  adminRegionIds: yup.array().of(optionSchema).required(),

  // Supplier
  newT1SupplierId: optionSchema.nullable(),
  newProducerId: optionSchema.nullable(),

  // Location
  newLocationType: optionSchema.nullable(),
  newLocationCountryInput: optionSchema.nullable(),
  newLocationAddressInput: yup.string(),
  newLocationLatitude: yup.number().min(-90).max(90),
  newLocationLongitude: yup.number().min(-180).max(180),

  // Material
  newMaterialId: optionSchema,

  // Coefficients
  DF_LUC_T: yup
    .number()
    .nullable()
    .transform((_, val) => (val === Number(val) ? val : null)),
  UWU_T: yup
    .number()
    .nullable()
    .transform((_, val) => (val === Number(val) ? val : null)),
  BL_LUC_T: yup
    .number()
    .nullable()
    .transform((_, val) => (val === Number(val) ? val : null)),
  GHG_LUC_T: yup
    .number()
    .nullable()
    .transform((_, val) => (val === Number(val) ? val : null)),
});

const LABEL_CLASSNAMES = 'text-sm';

const TYPES_OF_INTERVENTIONS = Object.values(InterventionTypes).map((interventionType) => ({
  value: interventionType,
  label: interventionType,
}));

const InterventionForm: React.FC<InterventionFormProps> = ({ isSubmitting, onSubmit }) => {
  const { query } = useRouter();

  const {
    register,
    control,
    watch,
    setValue,
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
  const { data: years, isLoading: isLoadingYears } = useSourcingRecordsYears();
  const optionsYears: SelectOptions = useMemo(
    () =>
      years.map((year) => ({
        label: year.toString(),
        value: year,
      })),
    [years],
  );

  useEffect(() => {
    if (currentInterventionType === InterventionTypes.SupplierLocation) {
      ['newMaterialId'].forEach((field) => resetField(field));
    } else if (currentInterventionType === InterventionTypes.Efficiency) {
      [
        'newMaterialId',
        'newT1SupplierId',
        'newProducerId',
        'newLocationCountryInput',
        'newLocationAddressInput',
        'newLocationLatitude',
        'newLocationLongitude',
      ].forEach((field) => resetField(field));
    }
  }, [currentInterventionType, resetField]);

  useEffect(() => setValue('scenarioId', query?.scenarioId), [query?.scenarioId, setValue]);

  useEffect(() => {
    if (currentInterventionType === InterventionTypes.Efficiency) {
      setValue('newLocationType', { label: 'Unknown', value: LocationTypes.unknown });
    }
  }, [currentInterventionType, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6 space-y-10">
      <input {...register('scenarioId')} type="hidden" value={watch('scenarioId')} />
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
            error={errors?.percentage?.message}
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
          <label className={LABEL_CLASSNAMES}>
            Region <sup>*</sup>
          </label>
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
                loading={isLoadingYears}
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
                        onChange={(selected) => setValue('newMaterialId', selected)}
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
                            <Input
                              type="text"
                              {...register('newLocationAddressInput')}
                              error={errors?.newLocationAddressInput?.message}
                            />
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
                                error={errors?.newLocationLatitude?.message}
                              />
                              <Input
                                {...register('newLocationLongitude')}
                                type="number"
                                placeholder="Longitude"
                                min={-180}
                                max={180}
                                className="w-full"
                                error={errors?.newLocationLongitude?.message}
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
                            name="newT1SupplierId"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                              <Select
                                {...field}
                                showSearch
                                loading={isLoadingSuppliers}
                                current={field.value}
                                options={optionsSuppliers}
                                placeholder="Select"
                                onChange={(value) => setValue('newT1SupplierId', value)}
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
                            defaultValue={null}
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
                          type="number"
                          placeholder="0"
                          // defaultValue={0}
                          error={errors?.GHG_LUC_T?.message}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASSNAMES}>Deforestation risk</label>
                        <Input
                          {...register('DF_LUC_T')}
                          type="number"
                          placeholder="0"
                          // defaultValue={0}
                          error={errors?.DF_LUC_T?.message}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASSNAMES}>Water withdrawal</label>
                        <Input
                          {...register('UWU_T')}
                          type="number"
                          placeholder="0"
                          // defaultValue={0}
                          error={errors?.UWU_T?.message}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASSNAMES}>Biodiversity impact</label>
                        <Input
                          {...register('BL_LUC_T')}
                          type="number"
                          placeholder="0"
                          // defaultValue={0}
                          error={errors?.BL_LUC_T?.message}
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
