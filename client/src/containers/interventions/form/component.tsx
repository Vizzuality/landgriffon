import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
import InfoToolTip from 'components/info-tooltip/component';

import InterventionTypeIcon from './intervention-type-icon';
// import type { LocationTypes } from '../enums';
import { InterventionTypes, LocationTypes, InfoTooltip } from '../enums';
import { isCoordinates } from 'utils/coordinates';

import type { SelectOptions } from 'components/select/types';
import type { Intervention, InterventionFormData } from '../types';

type InterventionFormProps = {
  intervention?: Intervention;
  isSubmitting?: boolean;
  onSubmit?: (interventionFormData: InterventionFormData) => void;
};

const optionSchema = yup.object({
  label: yup.string(),
  value: yup.string(),
});

const locationTypeSchema = yup.object({
  label: yup.string(),
  value: yup.mixed<LocationTypes>(),
});

const schemaValidation = yup.object({
  title: yup.string().max(60).required(),
  interventionType: yup.string().required(),
  startYear: yup
    .object({
      label: yup.string(),
      value: yup.number(),
    })
    .required(),
  percentage: yup.number().moreThan(0).max(100).required(),
  scenarioId: yup.string().required(),

  // Filters
  materialIds: yup.array().of(optionSchema).required(),
  businessUnitIds: yup.array().of(optionSchema),
  supplierIds: yup.array().of(optionSchema),
  adminRegionIds: yup.array().of(optionSchema),

  // Supplier
  newT1SupplierId: optionSchema.nullable(),
  newProducerId: optionSchema.nullable(),

  // Location
  newLocationType: yup.lazy(() => {
    return locationTypeSchema.when('interventionType', (interventionType) => {
      if (
        [InterventionTypes.Material, InterventionTypes.SupplierLocation].includes(interventionType)
      ) {
        return locationTypeSchema.required('Location type field is required');
      }

      return locationTypeSchema.nullable();
    });
  }),
  newLocationCountryInput: yup.lazy(() => {
    return optionSchema.when('interventionType', (interventionType) => {
      if (
        [InterventionTypes.Material, InterventionTypes.SupplierLocation].includes(interventionType)
      ) {
        return yup.object().required('Country field is required');
      }

      return yup.object().nullable();
    });
  }),

  cityAddressCoordinates: yup.lazy((_value) => {
    return yup.string().when('newLocationType', (locationType) => {
      if (
        [LocationTypes.aggregationPoint, LocationTypes.pointOfProduction].includes(
          locationType?.value,
        ) &&
        isCoordinates(_value)
      ) {
        return yup
          .string()
          .test('is-coordinates', 'Coordinates should be valid (-90/90, -180/180)', (value) => {
            const [lat, lng] = value.split(',').map((coordinate) => parseFloat(coordinate));
            return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
          });
      }

      return yup.string().nullable();
    });
  }),

  // New material
  newMaterialId: yup
    .array()
    .of(optionSchema)
    .when('interventionType', (interventionType) => {
      if (InterventionTypes.Material === interventionType) {
        return yup.array().of(optionSchema).required('New material field is required');
      }

      return yup.array().of(optionSchema).nullable();
    }),
  newLocationAddressInput: yup.string().nullable(),
  newLocationLongitude: yup.number().min(-180).max(180),
  newLocationLatitude: yup.number().min(-90).max(90),

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

type SubSchema = yup.InferType<typeof schemaValidation>;

const InterventionForm: React.FC<InterventionFormProps> = ({
  intervention,
  isSubmitting,
  onSubmit,
}) => {
  const {
    query: { scenarioId },
  } = useRouter();

  const {
    register,
    control,
    watch,
    setValue,
    resetField,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<SubSchema>({
    resolver: yupResolver(schemaValidation),
    ...(intervention && {
      defaultValues: {
        title: intervention?.title,
        scenarioId: null,
        percentage: intervention.percentage,
        startYear: {
          label: intervention.startYear.toString(),
          value: intervention.startYear,
        },
        materialIds: intervention.replacedMaterials.map(({ id, name }) => ({
          label: name,
          value: id,
        })),
        businessUnitIds: intervention.replacedBusinessUnits.map(({ id, name }) => ({
          label: name,
          value: id,
        })),
        adminRegionIds: intervention.replacedAdminRegions.map(({ id, name }) => ({
          label: name,
          value: id,
        })),
        supplierIds: intervention.replacedSuppliers.map(({ id, name }) => ({
          label: name,
          value: id,
        })),
        interventionType: intervention.type,
        newMaterialId: [
          {
            label: intervention.newMaterial?.name,
            value: intervention.newMaterial?.id,
          },
        ],
        newLocationType: {
          label: intervention.newLocationType,
          value: intervention.newLocationType,
        },
        // New location
        newLocationCountryInput: intervention.newLocationCountryInput
          ? {
              label: intervention.newLocationCountryInput,
              value: intervention.newLocationCountryInput,
            }
          : {},
        cityAddressCoordinates:
          intervention.newLocationAddressInput ||
          (intervention.newLocationLatitudeInput &&
            intervention.newLocationLongitudeInput &&
            `${intervention.newLocationLatitudeInput},${intervention.newLocationLongitudeInput}`) ||
          '',
        newLocationAddressInput: intervention?.newLocationAddressInput || null,
        // New supplier/producer
        newT1SupplierId: intervention?.newT1Supplier
          ? {
              label: intervention.newT1Supplier.name,
              value: intervention.newT1Supplier.id,
            }
          : null,
        newProducerId: intervention?.newProducer
          ? {
              label: intervention.newProducer.name,
              value: intervention.newProducer.id,
            }
          : null,
        // coefficients
        DF_LUC_T: intervention?.newIndicatorCoefficients?.DF_LUC_T || 0,
        UWU_T: intervention?.newIndicatorCoefficients?.UWU_T || 0,
        BL_LUC_T: intervention?.newIndicatorCoefficients?.BL_LUC_T || 0,
        GHG_LUC_T: intervention?.newIndicatorCoefficients?.GHG_LUC_T || 0,
      },
    }),
  });

  const closeSupplierRef = useRef<() => void>(null);
  const closeImpactsRef = useRef<() => void>(null);

  const {
    materialIds: currentMaterialIds,
    businessUnitIds: currentBusinessUnitIds,
    adminRegionIds: currentLocationIds,
    supplierIds: currentSupplierIds,
    interventionType: currentInterventionType,
    newLocationType: locationType,
    newT1SupplierId: currentT1SupplierId,
    newProducerId: currentProducerId,
    DF_LUC_T,
    UWU_T,
    BL_LUC_T,
    GHG_LUC_T,
  } = watch();

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
  const { data: locationTypes } = useLocationTypes();
  const optionsLocationTypes: SelectOptions<LocationTypes> = useMemo(
    () =>
      locationTypes.map(({ label, value }) => ({
        label: `${label[0].toUpperCase()}${label.substring(1)}`,
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
  const optionsYears: SelectOptions<number> = useMemo(
    () =>
      years.map((year) => ({
        label: year.toString(),
        value: year,
      })),
    [years],
  );

  useEffect(() => {
    // ? defaults to latest year unless the user is editing an intervention,
    // ? in that case, the start year will come from the intervention itself.
    if (optionsYears?.length && !intervention) {
      setValue('startYear', optionsYears[optionsYears.length - 1]);
    }
  }, [optionsYears, setValue, intervention]);

  useEffect(() => {
    if (currentInterventionType === InterventionTypes.SupplierLocation) {
      (['newMaterialId'] as const).forEach((field) => resetField(field));
    } else if (currentInterventionType === InterventionTypes.Efficiency) {
      (
        [
          'newMaterialId',
          'newT1SupplierId',
          'newProducerId',
          'cityAddressCoordinates',
          'newLocationCountryInput',
          'newLocationAddressInput',
          'newLocationLatitude',
          'newLocationLongitude',
        ] as const
      ).forEach((field) => resetField(field));
    }

    // * resets "impacts per ton" coefficients whenever the intervention type changes
    if (!intervention) {
      resetField('DF_LUC_T', { defaultValue: 0 });
      resetField('UWU_T', { defaultValue: 0 });
      resetField('BL_LUC_T', { defaultValue: 0 });
      resetField('GHG_LUC_T', { defaultValue: 0 });
    }

    // * resets supplier and producer info whenever the intervention type changes
    resetField('newT1SupplierId');
    resetField('newProducerId');

    // * closes "Supplier" panel whenever the intervention type changes
    if (closeSupplierRef.current !== null) {
      closeSupplierRef.current();
    }

    // * closes "Impacts per ton" panel whenever the intervention type changes
    if (closeImpactsRef.current !== null) {
      closeImpactsRef.current();
    }
  }, [currentInterventionType, resetField, closeSupplierRef, intervention]);

  useEffect(() => {
    clearErrors([
      'newMaterialId',
      'newT1SupplierId',
      'newProducerId',
      'cityAddressCoordinates',
      'newLocationType',
      'newLocationCountryInput',
      'newLocationAddressInput',
    ]);
  }, [currentInterventionType, clearErrors]);

  useEffect(() => {
    // * if a location type doesn't require coordinates, the coordinates fields are reset to avoid sending them unintentionally
    if (locationType?.value === LocationTypes.countryOfProduction) {
      resetField('cityAddressCoordinates');
      resetField('newLocationLatitude');
      resetField('newLocationLongitude');
    }
  }, [locationType, resetField]);

  useEffect(() => setValue('scenarioId', scenarioId as string), [scenarioId, setValue]);

  // When city, address or coordinates input are valid coordinates, set the location coordinates inputs
  useEffect(() => {
    const subscription = watch(({ cityAddressCoordinates }, { name, type }) => {
      if (name === 'cityAddressCoordinates' && type === 'change') {
        if (isCoordinates(cityAddressCoordinates)) {
          const [lat, lng]: number[] = cityAddressCoordinates
            .split(',')
            .map((coordinate: string) => Number.parseFloat(coordinate));
          setValue('newLocationLatitude', lat);
          setValue('newLocationLongitude', lng);
          resetField('newLocationAddressInput');
        } else {
          setValue('newLocationAddressInput', cityAddressCoordinates);
          resetField('newLocationLatitude');
          resetField('newLocationLongitude');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [resetField, setValue, watch]);

  const areCoefficientsEdited = useMemo(
    () => DF_LUC_T !== 0 || GHG_LUC_T !== 0 || UWU_T !== 0 || BL_LUC_T !== 0,
    [DF_LUC_T, GHG_LUC_T, UWU_T, BL_LUC_T],
  );

  const areSupplierEdited = useMemo(
    () => Boolean(currentT1SupplierId || currentProducerId),
    [currentT1SupplierId, currentProducerId],
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-2 gap-6 space-y-10"
      data-testid="intervention-form"
    >
      <input {...register('scenarioId')} type="hidden" value={watch('scenarioId')} />
      <div className="flex flex-col justify-center pr-10">
        <h2>1. Apply intervention to...</h2>
        <p className="text-sm text-gray-500">
          Choose to which data of your supply chain you want to apply the intervention in order to
          analyze changes.
        </p>
      </div>
      <div className="pl-10 space-y-4 border-l-2 border-gray-100">
        <div>
          <label className={LABEL_CLASSNAMES}>
            Title <sup>*</sup>
          </label>
          <Input
            {...register('title')}
            type="text"
            data-testid="title-input"
            error={errors?.title?.message}
          />
        </div>
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
            render={({ field, fieldState: { invalid } }) => (
              <div data-testid="materials-select">
                <MaterialsSelect
                  {...field}
                  multiple={false}
                  withSourcingLocations
                  current={field.value}
                  businessUnitIds={currentBusinessUnitIds?.map(({ value }) => value)}
                  supplierIds={currentSupplierIds?.map(({ value }) => value)}
                  originIds={currentLocationIds?.map(({ value }) => value)}
                  onChange={(selected) => {
                    if (invalid) clearErrors('materialIds');
                    setValue('materialIds', selected && [selected]);
                  }}
                  error={!!errors?.materialIds}
                />
              </div>
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
                error={!!errors?.businessUnitIds}
                data-testid="business-units-select"
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
                error={!!errors?.adminRegionIds}
                data-testid="location-select"
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
                error={!!errors?.supplierIds}
                data-testid="supplier-ids-select"
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
            render={({ field }) => (
              <div data-testid="startYear-select">
                <Select
                  {...field}
                  instanceId="startYear"
                  showSearch
                  current={field.value}
                  options={optionsYears}
                  placeholder="Select a year"
                  onChange={(value) => setValue('startYear', value)}
                  loading={isLoadingYears}
                  error={!!errors?.startYear}
                />
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col justify-center pr-10">
        <h2>2. Type of intervention</h2>
      </div>
      <div className="pl-10 border-l-2 border-gray-100">
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
                    data-testid="intervention-type-option"
                  >
                    {({ active, checked }) => (
                      <div className="flex items-center space-x-4">
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

          <div className="pl-10 space-y-10 border-l-2 border-gray-100">
            {currentInterventionType === InterventionTypes.Material && (
              <div className="space-y-4">
                <div className="flex items-center space-x-1">
                  <h3>New material</h3>
                  <InfoToolTip info={InfoTooltip.newMaterial} />
                </div>
                <div>
                  <label className={LABEL_CLASSNAMES}>
                    New material <sup>*</sup>
                  </label>
                  <Controller
                    name="newMaterialId"
                    control={control}
                    render={({ field, fieldState: { invalid } }) => (
                      <div data-testid="new-material-select">
                        <MaterialsSelect
                          {...field}
                          multiple={false}
                          current={field.value}
                          onChange={(selected) => {
                            if (invalid) clearErrors('newMaterialId');
                            setValue('newMaterialId', [selected]);
                          }}
                          error={!!errors?.newMaterialId}
                        />
                      </div>
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
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-1">
                        <h3>New location</h3>
                        <InfoToolTip info={InfoTooltip.supplierLocation} />
                      </div>
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
                            render={({ field, fieldState: { invalid } }) => (
                              <div data-testid="new-location-select">
                                <Select
                                  {...field}
                                  showSearch
                                  loading={isLoadingProducers}
                                  current={field.value}
                                  options={optionsLocationTypes}
                                  placeholder="Select"
                                  onChange={(value) => {
                                    if (invalid) clearErrors('newLocationType');
                                    setValue('newLocationType', value);
                                  }}
                                  error={!!errors?.newLocationType}
                                  data-testid="new-location-select"
                                />
                              </div>
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
                            render={({ field, fieldState: { invalid } }) => (
                              <div data-testid="new-location-country-select">
                                <Select
                                  {...field}
                                  showSearch
                                  loading={isLoadingCountries}
                                  current={field.value}
                                  options={optionsCountries}
                                  placeholder="Select"
                                  onChange={(value) => {
                                    if (invalid) clearErrors('newLocationCountryInput');
                                    setValue('newLocationCountryInput', value);
                                  }}
                                  error={!!errors?.newLocationCountryInput}
                                />
                              </div>
                            )}
                          />
                        </div>
                        {[LocationTypes.aggregationPoint, LocationTypes.pointOfProduction].includes(
                          locationType?.value,
                        ) && (
                          <>
                            <div data-testid="city-address-coordinates-field">
                              <label className={LABEL_CLASSNAMES}>
                                City, address or coordinates
                              </label>
                              <Input
                                type="text"
                                {...register('cityAddressCoordinates')}
                                error={errors?.cityAddressCoordinates?.message}
                              />
                              <div className="mt-1 text-xs text-gray-500">
                                Add lat and long coordinates separated by comma, e.g. 40, -3
                              </div>
                            </div>
                            <div className="hidden">
                              <Input
                                type="text"
                                {...register('newLocationAddressInput')}
                                error={errors?.newLocationAddressInput?.message}
                              />
                            </div>
                          </>
                        )}
                        {locationType?.value === LocationTypes.aggregationPoint && (
                          <div className="hidden">
                            <div className="flex w-full space-x-2">
                              <Input
                                {...register('newLocationLatitude')}
                                type="hidden"
                                placeholder="Latitude"
                                min={-90}
                                max={90}
                                className="w-full"
                              />
                              <Input
                                {...register('newLocationLongitude')}
                                type="hidden"
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
                {({ open, close }) => {
                  closeSupplierRef.current = close;

                  return (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-1">
                          <h3 className="inline-block">Supplier</h3>{' '}
                          <span className="text-gray-500 text-regular">(optional)</span>
                          <InfoToolTip info={InfoTooltip.newSupplier} />
                        </div>
                        <Disclosure.Button
                          className={classNames(
                            'border-primary border w-6 h-6 rounded flex items-center justify-center',
                            open ? 'bg-primary' : 'bg-transparent',
                          )}
                        >
                          {open ? (
                            <MinusIcon className="w-5 h-5 text-white" />
                          ) : (
                            <PlusIcon className="w-5 h-5 text-primary" />
                          )}
                        </Disclosure.Button>
                      </div>
                      <Disclosure.Panel static={areSupplierEdited}>
                        <div className="space-y-4">
                          <div>
                            <label className={LABEL_CLASSNAMES}>Tier 1 supplier</label>
                            <Controller
                              name="newT1SupplierId"
                              control={control}
                              defaultValue={null}
                              render={({ field }) => (
                                <div data-testid="new-t1-supplier-select">
                                  <Select
                                    {...field}
                                    showSearch
                                    loading={isLoadingSuppliers}
                                    current={field.value}
                                    options={optionsSuppliers}
                                    placeholder="Select"
                                    onChange={(value) => setValue('newT1SupplierId', value)}
                                    error={!!errors?.newT1SupplierId}
                                    allowEmpty
                                  />
                                </div>
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
                                <div data-testid="new-producer-select">
                                  <Select
                                    {...field}
                                    showSearch
                                    loading={isLoadingProducers}
                                    current={field.value}
                                    options={optionsProducers}
                                    placeholder="Select"
                                    onChange={(value) => setValue('newProducerId', value)}
                                    error={!!errors?.newProducerId}
                                    allowEmpty
                                  />
                                </div>
                              )}
                            />
                          </div>
                        </div>
                      </Disclosure.Panel>
                    </>
                  );
                }}
              </Disclosure>
            )}

            <Disclosure as="div" className="space-y-4">
              {({ open, close }) => {
                closeImpactsRef.current = close;

                return (
                  <>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-1">
                        <h3>Impacts per ton</h3>
                        {currentInterventionType !== InterventionTypes.Efficiency && (
                          <span className="text-gray-500 text-regular">(optional)</span>
                        )}
                        <InfoToolTip info={InfoTooltip.supplierImpactsPerTon} />
                      </div>
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
                      static={
                        currentInterventionType === InterventionTypes.Efficiency ||
                        areCoefficientsEdited
                      }
                    >
                      <div className="space-y-4">
                        <div>
                          <label className={LABEL_CLASSNAMES}>Carbon emission</label>
                          <Input
                            {...register('GHG_LUC_T')}
                            type="number"
                            step={0.001}
                            min={0}
                            defaultValue={0}
                            error={errors?.GHG_LUC_T?.message}
                            theme="inside-unit"
                            unit="tC02e"
                            data-testid="GHG_LUC_T-input"
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLASSNAMES}>Deforestation risk</label>
                          <Input
                            {...register('DF_LUC_T')}
                            type="number"
                            step={0.001}
                            min={0}
                            defaultValue={0}
                            error={errors?.DF_LUC_T?.message}
                            theme="inside-unit"
                            unit="Ha"
                            data-testid="DF_LUC_T-input"
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLASSNAMES}>Water withdrawal</label>
                          <Input
                            {...register('UWU_T')}
                            type="number"
                            step={0.001}
                            min={0}
                            defaultValue={0}
                            error={errors?.UWU_T?.message}
                            theme="inside-unit"
                            unit="100m3"
                            data-testid="UWU_T-input"
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLASSNAMES}>Biodiversity impact</label>
                          <Input
                            {...register('BL_LUC_T')}
                            type="number"
                            step={0.001}
                            min={0}
                            defaultValue={0}
                            error={errors?.BL_LUC_T?.message}
                            theme="inside-unit"
                            unit="PDF"
                            data-testid="BL_LUC_T-input"
                          />
                        </div>
                      </div>
                    </Disclosure.Panel>
                  </>
                );
              }}
            </Disclosure>
          </div>
        </>
      )}

      <div className="col-span-2">
        <div className="mb-6 text-sm text-right text-gray-500">
          Fields marked with (*) are mandatory.
        </div>
        <div className="flex justify-end space-x-6">
          <Link href="/admin/scenarios" passHref>
            <AnchorLink theme="secondary">Cancel</AnchorLink>
          </Link>
          <Button loading={isSubmitting} type="submit" data-testid="intervention-submit-btn">
            Save intervention
          </Button>
        </div>
      </div>
    </form>
  );
};

export default InterventionForm;
