import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { RadioGroup, Disclosure } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { PlusIcon, MinusIcon } from '@heroicons/react/solid';
import * as yup from 'yup';
import classNames from 'classnames';
import { sortBy, omit } from 'lodash-es';

import { InterventionTypes, LocationTypes, InfoTooltip } from '../enums';

import InterventionTypeIcon from './intervention-type-icon';

import { useIndicators } from 'hooks/indicators';
import { useSuppliersTypes } from 'hooks/suppliers';
import { useLocationTypes } from 'hooks/location-types';
import { useAdminRegionsTrees, useAdminRegionsByCountry } from 'hooks/admin-regions';
import { useSourcingRecordsYears } from 'hooks/sourcing-records';
import MaterialsSelect from 'containers/materials/select';
import BusinessUnitsSelect from 'containers/business-units/select';
import LocationsSelect from 'containers/locations/select';
import SuppliersSelect from 'containers/suppliers/select';
import Input from 'components/forms/input';
import { Anchor, Button } from 'components/button';
import Select, { AutoCompleteSelect } from 'components/forms/select';
import InfoToolTip from 'components/info-tooltip/component';
import { isCoordinates } from 'utils/coordinates';
import Hint from 'components/forms/hint';
import TreeSelect from 'components/tree-select';
import { recursiveMap, recursiveSort } from 'components/tree-select/utils';

import type { Option } from 'components/forms/select';
import type { Intervention, InterventionFormData } from '../types';

const DISABLED_LOCATION_TYPES = [LocationTypes.unknown, LocationTypes.countryOfDelivery];

type InterventionFormProps = {
  intervention?: Intervention;
  isCreation?: boolean;
  isSubmitting?: boolean;
  onSubmit?: (interventionFormData: InterventionFormData) => void;
};

const optionSchema = yup
  .object({
    label: yup.string(),
    value: yup.string(),
  })
  .default(undefined);

const locationTypeSchema = yup
  .object({
    label: yup.string().nullable(),
    value: yup.mixed<LocationTypes>(),
  })
  .default(undefined);

const schemaValidation = yup.object({
  title: yup.string().label('Title').max(60).required(),
  volume: yup.number().optional(),
  interventionType: yup
    .string()
    .label('Intervention type')
    .required('Type of intervention is required'),
  startYear: yup
    .object({
      label: yup.string(),
      value: yup.number(),
    })
    .label('Start year')
    .required(),
  endYear: yup
    .object({
      label: yup.string(),
      value: yup.number(),
    })
    .label('End year')
    .optional(),
  percentage: yup.number().label('Percentage').moreThan(0).max(100).required(),
  scenarioId: yup.string().label('Scenario ID').required(),

  // Filters
  materialIds: yup.array().label('Material IDs').of(optionSchema).required(),
  businessUnitIds: yup.array().label('Business Unit IDs').of(optionSchema),
  supplierIds: yup.array().label('Supplier IDs').of(optionSchema),
  adminRegionIds: yup.array().label('Admin region IDs').of(optionSchema),

  // Supplier
  newT1SupplierId: optionSchema.label('New T1 Supplier ID').nullable(),
  newProducerId: optionSchema.label('New producer ID').nullable(),

  // Location
  newLocationType: locationTypeSchema.label('New location type').when('interventionType', {
    is: (interventionType: InterventionTypes) => {
      return [InterventionTypes.Material, InterventionTypes.SupplierLocation].includes(
        interventionType,
      );
    },
    then: locationTypeSchema.required(),
    otherwise: locationTypeSchema.notRequired(),
  }),
  newLocationCountryInput: optionSchema.label('New location Country').when('interventionType', {
    is: (interventionType: InterventionTypes) =>
      [InterventionTypes.Material, InterventionTypes.SupplierLocation].includes(interventionType),
    then: (schema) => schema.required('Country field is required'),
    otherwise: (schema) => schema.nullable(),
  }),

  cityAddressCoordinates: yup
    .string()
    .label('City, addres or coordinates')
    .when('newLocationType', {
      is: (newLocationType) =>
        [LocationTypes.aggregationPoint, LocationTypes.pointOfProduction].includes(
          newLocationType?.value,
        ),
      then: (schema) =>
        schema
          .test('is-coordinates', 'Coordinates should be valid (-90/90, -180/180)', (value) => {
            if (!isCoordinates(value)) {
              return true;
            }
            const [lat, lng] = value.split(',').map((coordinate) => parseFloat(coordinate));
            return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
          })
          .required('City, address or coordinates is required'),
      otherwise: (schema) => schema.nullable(),
    }),

  // location region
  newLocationAdminRegionInput: optionSchema.when('newLocationType', {
    is: (newLocationType) =>
      [LocationTypes.administrativeRegionOfProduction].includes(newLocationType?.value),
    then: (schema) => schema.required('Country region is required').nullable(),
    otherwise: (schema) => schema.nullable(),
  }),

  // New material
  newMaterialId: yup
    .array()
    .label('New material')
    .of(optionSchema)
    .when('interventionType', (interventionType) => {
      if (InterventionTypes.Material === interventionType) {
        return yup.array().of(optionSchema).required('New material field is required');
      }

      return yup.array().of(optionSchema).nullable();
    }),
  newLocationAddressInput: yup.string().label('Address').nullable(),
  newLocationLongitude: yup
    .number()
    .label('Longitude')
    .when('newLocationType', {
      is: (newLocationType) =>
        [LocationTypes.aggregationPoint, LocationTypes.pointOfProduction].includes(
          newLocationType?.value,
        ),
      then: (schema) => schema.min(-180).max(180).required('Longitude field is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  newLocationLatitude: yup
    .number()
    .label('Latitude')
    .when('newLocationType', {
      is: (newLocationType) =>
        [LocationTypes.aggregationPoint, LocationTypes.pointOfProduction].includes(
          newLocationType?.value,
        ),
      then: (schema) => schema.min(-90).max(90).required('Latitude field is required'),
      otherwise: (schema) => schema.nullable(),
    }),

  // Coefficients
  coefficients: yup.lazy((coefficientObject = {}) => {
    const schema = Object.keys(coefficientObject).reduce(
      (prevValue, currentValue) => ({
        ...prevValue,
        [currentValue]: yup.lazy((v) => {
          if (v === '') return yup.string().required('This coefficient is required.');

          return yup.number();
        }),
      }),
      {},
    );
    return yup.object(schema);
  }),
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
  isCreation = false,
}) => {
  const {
    query: { scenarioId },
  } = useRouter();

  const { data: indicators } = useIndicators(
    { include: 'unit', sort: 'name' },
    { select: (data) => data.data },
  );

  const indicatorNameCodes = useMemo(
    () =>
      indicators?.map(({ nameCode, status }) => ({ nameCode, disabled: status === 'inactive' })),
    [indicators],
  );

  const closeSupplierRef = useRef<() => void>(null);
  const closeImpactsRef = useRef<() => void>(null);

  // Suppliers
  const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliersTypes({
    type: 't1supplier',
  });
  const optionsSuppliers = useMemo<Option[]>(
    () =>
      suppliers?.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      })),
    [suppliers],
  );

  // Producers
  const { data: producers, isLoading: isLoadingProducers } = useSuppliersTypes({
    type: 'producer',
  });
  const optionsProducers = useMemo<Option[]>(
    () =>
      producers?.map((producer) => ({
        label: producer.name,
        value: producer.id,
      })),
    [producers],
  );

  // Location types
  const { data: locationTypes, isLoading: isLoadingLocationTypes } = useLocationTypes(
    { supported: true },
    {
      select: (_locationTypes) =>
        _locationTypes.map((locationTypeOption) => ({
          ...locationTypeOption,
          // ! this is a temporary workaround, disabling should come from API. Remove as soon as it is available in API.
          disabled: DISABLED_LOCATION_TYPES.includes(locationTypeOption.value),
        })),
    },
  );

  // Countries
  const { data: countries, isLoading: isLoadingCountries } = useAdminRegionsTrees({ depth: 0 });
  const optionsCountries = useMemo<Option[]>(
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
  const optionsYears: Option<number>[] = useMemo(
    () =>
      years.map((year) => ({
        label: year.toString(),
        value: year,
      })),
    [years],
  );

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
    ...(intervention &&
      indicatorNameCodes && {
        defaultValues: {
          title: intervention?.title,
          scenarioId: '',
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
            label: locationTypes.find(({ value }) => value === intervention.newLocationType)?.label,
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
              `${intervention.newLocationLatitudeInput}, ${intervention.newLocationLongitudeInput}`) ||
            null,
          newLocationAddressInput: intervention?.newLocationAddressInput || null,
          newLocationLatitude: intervention?.newLocationLatitudeInput
            ? Number(intervention?.newLocationLatitudeInput)
            : 0,
          newLocationLongitude: intervention?.newLocationLongitudeInput
            ? Number(intervention?.newLocationLongitudeInput)
            : 0,
          newLocationAdminRegionInput: intervention.newAdminRegion
            ? {
                label: intervention.newAdminRegion.name,
                value: intervention.newAdminRegion.id,
              }
            : null,

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
          coefficients: {
            ...(Object.keys(intervention?.newIndicatorCoefficients || {}).length &&
              Object.keys(intervention.newIndicatorCoefficients).reduce(
                (prev, current) => ({
                  ...prev,
                  [current]: intervention.newIndicatorCoefficients[current],
                }),
                {},
              )),
          },
        },
      }),
    shouldFocusError: true,
  });

  const {
    materialIds: currentMaterialIds,
    businessUnitIds: currentBusinessUnitIds,
    adminRegionIds: currentLocationIds,
    supplierIds: currentSupplierIds,
    interventionType: currentInterventionType,
    newLocationType: locationType,
    newT1SupplierId: currentT1SupplierId,
    newProducerId: currentProducerId,
    newLocationCountryInput: currentCountry,
    coefficients = {},
  } = watch();

  const countryId = useMemo(() => {
    return countries.find(({ name }) => currentCountry?.label === name)?.id || null;
  }, [countries, currentCountry]);

  const { data: regionsByCountry, isFetching: isFetchingRegions } = useAdminRegionsByCountry(
    countryId,
    {},
    {
      enabled:
        Boolean(countryId) &&
        locationType?.value === LocationTypes.administrativeRegionOfProduction,
      select: (_country) =>
        recursiveSort(_country.children, 'name').map((child) =>
          recursiveMap(child, ({ name }) => ({ value: name, label: name })),
        ),
    },
  );

  // Populate the new location field when the location type options changes
  useEffect(() => {
    if (intervention?.newLocationType) {
      setValue('newLocationType', {
        label: locationTypes.find(({ value }) => value === intervention.newLocationType)?.label,
        value: intervention.newLocationType,
      });
    }
  }, [intervention?.newLocationType, locationTypes, setValue]);

  useEffect(() => {
    // ? defaults to latest year unless the user is editing an intervention,
    // ? in that case, the start year will come from the intervention itself.
    if (optionsYears?.length && !intervention) {
      setValue('startYear', optionsYears[optionsYears.length - 1]);
    }
  }, [optionsYears, setValue, intervention]);

  useEffect(() => {
    if (currentInterventionType === InterventionTypes.SupplierLocation) {
      (['newMaterialId'] as const).forEach((field) => resetField(field, { defaultValue: null }));
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
      ).forEach((field) => resetField(field, { defaultValue: null }));
    }

    // * resets "impacts per ton" coefficients whenever the intervention type changes
    if (!intervention) {
      Object.values(indicatorNameCodes).forEach((indicatorKey) => {
        // @ts-expect-error not sure how to solve this dynamic typing
        resetField(`coefficients.${indicatorKey}`, { defaultValue: 0 });
      });
    }

    // * resets supplier and producer info whenever the intervention type changes
    resetField('newT1SupplierId', { defaultValue: null });
    resetField('newProducerId', { defaultValue: null });

    // * closes "Supplier" panel whenever the intervention type changes
    if (closeSupplierRef.current !== null) {
      closeSupplierRef.current();
    }
  }, [currentInterventionType, resetField, closeSupplierRef, intervention, indicatorNameCodes]);

  useEffect(() => {
    clearErrors([
      'newMaterialId',
      'newT1SupplierId',
      'newProducerId',
      'cityAddressCoordinates',
      'newLocationType',
      'newLocationCountryInput',
      'newLocationAddressInput',
      'newLocationLatitude',
      'newLocationLongitude',
    ]);
  }, [currentInterventionType, clearErrors]);

  useEffect(() => {
    // * resets the region field whenever the user chooses any location type but administrive region one
    if (![LocationTypes.administrativeRegionOfProduction].includes(locationType?.value)) {
      resetField('newLocationAdminRegionInput', { defaultValue: null });
    }

    // * if a location type doesn't require coordinates, the coordinates fields are reset to avoid sending them unintentionally
    if (
      [
        LocationTypes.countryOfProduction,
        LocationTypes.countryOfDelivery,
        LocationTypes.unknown,
      ].includes(locationType?.value)
    ) {
      resetField('cityAddressCoordinates', { defaultValue: null });
      resetField('newLocationLatitude', { defaultValue: 0 });
      resetField('newLocationLongitude', { defaultValue: 0 });
    }
  }, [locationType, resetField, setValue]);

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
          resetField('newLocationAddressInput', { defaultValue: null });
        } else {
          setValue('newLocationAddressInput', cityAddressCoordinates);
          resetField('newLocationLatitude', { defaultValue: 0 });
          resetField('newLocationLongitude', { defaultValue: 0 });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [resetField, setValue, watch]);

  // ? I had to put this variable out of useMemo because it looks like
  // ? the form mutates the coefficients object and the below useMemo doesn't trigger after a second change.
  const cofficientValues = Object.values(coefficients);

  const areCoefficientsEdited = useMemo(() => {
    if (!cofficientValues) return false;
    return cofficientValues.filter((v) => v).some((v) => +v !== 0);
  }, [cofficientValues]);

  const areSupplierEdited = useMemo(
    () => Boolean(currentT1SupplierId || currentProducerId),
    [currentT1SupplierId, currentProducerId],
  );

  useEffect(() => {
    // * closes "Impacts per ton" panel whenever the intervention type changes and coefficients are not edited
    if (
      closeImpactsRef.current !== null &&
      !areCoefficientsEdited &&
      currentInterventionType !== InterventionTypes.Efficiency
    ) {
      closeImpactsRef.current();
    }
  }, [currentInterventionType, areCoefficientsEdited]);

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
            render={({ field: { onChange, value, ...field }, fieldState: { invalid } }) => (
              <div data-testid="materials-select">
                <MaterialsSelect
                  {...field}
                  multiple={false}
                  withSourcingLocations
                  current={value?.[0]}
                  businessUnitIds={currentBusinessUnitIds?.map(({ value }) => value)}
                  supplierIds={currentSupplierIds?.map(({ value }) => value)}
                  originIds={currentLocationIds?.map(({ value }) => value)}
                  onChange={(selected) => {
                    if (invalid) clearErrors('materialIds');
                    onChange?.(selected && [selected]);
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
            render={({ field: { value, ...field } }) => (
              <BusinessUnitsSelect
                {...field}
                multiple
                placeholder="All business units"
                checkedStrategy={isCreation ? 'CHILD' : undefined}
                materialIds={currentMaterialIds?.map(({ value }) => value)}
                supplierIds={currentSupplierIds?.map(({ value }) => value)}
                originIds={currentLocationIds?.map(({ value }) => value)}
                withSourcingLocations
                current={value}
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
            render={({ field: { value, ...field } }) => (
              <LocationsSelect
                {...field}
                multiple
                placeholder="All regions"
                materialIds={currentMaterialIds?.map(({ value }) => value)}
                supplierIds={currentSupplierIds?.map(({ value }) => value)}
                businessUnitIds={currentBusinessUnitIds?.map(({ value }) => value)}
                withSourcingLocations
                current={value}
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
            render={({ field: { value, ...field } }) => (
              <SuppliersSelect
                {...field}
                multiple
                materialIds={currentMaterialIds?.map(({ value }) => value)}
                businessUnitIds={currentBusinessUnitIds?.map(({ value }) => value)}
                originIds={currentLocationIds?.map(({ value }) => value)}
                withSourcingLocations
                current={value}
                error={!!errors?.supplierIds}
                data-testid="supplier-ids-select"
              />
            )}
          />
        </div>
        <div>
          <label className={LABEL_CLASSNAMES}>
            Start year of implementation <sup>*</sup>
          </label>
          <Controller
            name="startYear"
            control={control}
            render={({ field: { value, ...field } }) => (
              <Select<number>
                {...omit(field, 'ref')}
                id="startYear"
                defaultValue={value}
                options={optionsYears}
                placeholder="Select a year"
                onChange={(value: Option<number>) => setValue('startYear', value)}
                loading={isLoadingYears}
                error={errors?.startYear?.value?.message}
              />
            )}
          />
        </div>
        <div>
          <label className={LABEL_CLASSNAMES}>End year of implementation</label>
          <Controller
            name="endYear"
            control={control}
            render={({ field: { value, ...field } }) => (
              <Select<number>
                {...omit(field, 'ref')}
                id="endYear"
                value={value}
                options={[]}
                placeholder="Select a year"
                onChange={(value: Option<number>) => setValue('endYear', value)}
                loading={isLoadingYears}
                error={errors?.endYear?.value?.message}
                disabled
              />
            )}
          />
        </div>
      </div>

      <div className="flex flex-col justify-center pr-10">
        <h2>2. Type of intervention *</h2>
      </div>
      <div className="pl-10 border-l-2 border-gray-100">
        <Controller
          name="interventionType"
          control={control}
          render={({ field, fieldState: { invalid } }) => (
            <RadioGroup
              {...field}
              onChange={(value) => {
                if (invalid) clearErrors('interventionType');
                setValue('interventionType', value);
              }}
            >
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
                          ? 'border-orange-100 bg-orange-50 text-gray-900'
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
                {errors.interventionType && (
                  <Hint data-testid={'hint-input-interventionType'}>
                    {errors.interventionType.message}
                  </Hint>
                )}
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
                    render={({ field: { onChange, value, ...field }, fieldState: { invalid } }) => (
                      <div data-testid="new-material-select">
                        <MaterialsSelect
                          {...field}
                          placeholder="Select a material"
                          multiple={false}
                          current={value?.[0]}
                          onChange={(selected) => {
                            if (invalid) clearErrors('newMaterialId');
                            onChange?.(selected ? [selected] : []);
                          }}
                          error={!!errors?.newMaterialId}
                        />
                      </div>
                    )}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASSNAMES}>Tons of new material per tone</label>
                  <Input
                    {...register('volume')}
                    type="text"
                    data-testid="volume-input"
                    error={errors?.volume?.message}
                    placeholder="0"
                    disabled
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
                          'border-navy-400 border w-6 h-6 rounded flex items-center justify-center',
                          open ? 'bg-navy-400' : 'bg-transparent',
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
                          <PlusIcon className="w-5 h-5 text-navy-400" />
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
                              <AutoCompleteSelect<LocationTypes>
                                {...omit(field, 'ref')}
                                loading={isLoadingLocationTypes}
                                value={field.value}
                                options={locationTypes}
                                placeholder="Select"
                                onChange={(value) => {
                                  if (invalid) clearErrors('newLocationType');
                                  setValue('newLocationType', value);
                                }}
                                error={errors?.newLocationType?.value?.message}
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
                            render={({ field, fieldState: { invalid } }) => (
                              <AutoCompleteSelect
                                {...omit(field, 'ref')}
                                loading={isLoadingCountries}
                                value={field.value}
                                options={optionsCountries}
                                placeholder="Select"
                                onChange={(value) => {
                                  if (invalid) clearErrors('newLocationCountryInput');
                                  if (
                                    locationType?.value ===
                                    LocationTypes.administrativeRegionOfProduction
                                  ) {
                                    resetField('newLocationAdminRegionInput', {
                                      defaultValue: null,
                                    });
                                  }

                                  setValue('newLocationCountryInput', value);
                                }}
                                error={errors?.newLocationCountryInput?.value?.message}
                              />
                            )}
                          />
                        </div>
                        {[LocationTypes.aggregationPoint, LocationTypes.pointOfProduction].includes(
                          locationType?.value,
                        ) && (
                          <>
                            <div data-testid="city-address-coordinates-field">
                              <label className={LABEL_CLASSNAMES}>
                                City, address or coordinates <sup>*</sup>
                              </label>
                              <Input
                                type="text"
                                {...register('cityAddressCoordinates')}
                                error={
                                  errors?.cityAddressCoordinates?.message ||
                                  errors?.newLocationAddressInput?.message ||
                                  errors?.newLocationLatitude?.message ||
                                  errors?.newLocationLongitude?.message
                                }
                              />
                              <div className="mt-1 text-xs text-gray-500">
                                Add lat and long coordinates separated by comma, e.g. 40, -3
                              </div>
                            </div>
                            <div className="hidden">
                              <Input type="text" {...register('newLocationAddressInput')} />
                            </div>
                          </>
                        )}
                        {[LocationTypes.administrativeRegionOfProduction].includes(
                          locationType?.value,
                        ) && (
                          <>
                            <div data-testid="administrative-region-production-field">
                              <label className={LABEL_CLASSNAMES}>
                                Region <sup>*</sup>
                              </label>
                              <Controller
                                name="newLocationAdminRegionInput"
                                control={control}
                                render={({
                                  field: { onChange, value },
                                  fieldState: { invalid },
                                }) => (
                                  <div data-testid="new-location-region-select">
                                    <TreeSelect
                                      options={regionsByCountry}
                                      current={value}
                                      placeholder="Select a region"
                                      multiple={false}
                                      showSearch
                                      disabled={
                                        !Boolean(currentCountry) ||
                                        (currentCountry && isFetchingRegions) ||
                                        regionsByCountry?.length === 0
                                      }
                                      loading={isFetchingRegions}
                                      onChange={(option) => {
                                        if (invalid) clearErrors('newLocationAdminRegionInput');
                                        if (option) {
                                          onChange({ label: option.label, value: option.value });
                                        } else {
                                          resetField('newLocationAdminRegionInput', {
                                            defaultValue: null,
                                          });
                                        }
                                      }}
                                      error={!!errors?.newLocationAdminRegionInput}
                                    />
                                    {errors.newLocationAdminRegionInput && (
                                      <Hint data-testid={'hint-input-newLocationAdminRegionInput'}>
                                        {errors.newLocationAdminRegionInput.message}
                                      </Hint>
                                    )}
                                  </div>
                                )}
                              />
                            </div>
                          </>
                        )}
                        {(locationType?.value === LocationTypes.aggregationPoint ||
                          locationType?.value === LocationTypes.pointOfProduction) && (
                          <div className="hidden">
                            <div className="flex w-full space-x-2">
                              <Input
                                {...register('newLocationLatitude')}
                                type="text"
                                placeholder="Latitude"
                                className="w-full"
                              />
                              <Input
                                {...register('newLocationLongitude')}
                                type="text"
                                placeholder="Longitude"
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
                        {areSupplierEdited || (
                          <Disclosure.Button
                            className={classNames(
                              'border-navy-400 border w-6 h-6 rounded flex items-center justify-center',
                              open ? 'bg-navy-400' : 'bg-transparent',
                            )}
                          >
                            {open ? (
                              <MinusIcon className="w-5 h-5 text-white" />
                            ) : (
                              <PlusIcon className="w-5 h-5 text-navy-400" />
                            )}
                          </Disclosure.Button>
                        )}
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
                                  <AutoCompleteSelect
                                    {...omit(field, 'ref')}
                                    loading={isLoadingSuppliers}
                                    value={field.value}
                                    options={optionsSuppliers}
                                    placeholder="Select"
                                    onChange={(value) => setValue('newT1SupplierId', value)}
                                    error={errors?.newT1SupplierId?.message?.toString()}
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
                                  <AutoCompleteSelect
                                    {...omit(field, 'ref')}
                                    loading={isLoadingProducers}
                                    value={field.value}
                                    options={optionsProducers}
                                    placeholder="Select"
                                    onChange={(value) => setValue('newProducerId', value)}
                                    error={errors?.newProducerId?.message?.toString()}
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

            <Disclosure
              as="div"
              className="space-y-4"
              defaultOpen={
                currentInterventionType === InterventionTypes.Efficiency || areCoefficientsEdited
              }
            >
              {({ open, close }) => {
                closeImpactsRef.current = close;

                return (
                  <div data-testid="fieldset-impacts-per-ton">
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
                          'border-navy-400 border w-6 h-6 rounded flex items-center justify-center',
                          open ? 'bg-navy-400' : 'bg-transparent',
                          currentInterventionType === InterventionTypes.Efficiency && 'hidden',
                        )}
                      >
                        {open ? (
                          <MinusIcon className="w-5 h-5 text-white" />
                        ) : (
                          <PlusIcon className="w-5 h-5 text-navy-400" />
                        )}
                      </Disclosure.Button>
                    </div>
                    <Disclosure.Panel
                      static={currentInterventionType === InterventionTypes.Efficiency}
                    >
                      <div className="space-y-4">
                        {indicators?.map((indicator) => (
                          <div key={indicator.id}>
                            <label
                              className={classNames(LABEL_CLASSNAMES, {
                                'text-gray-300': indicator.status === 'inactive',
                              })}
                            >
                              {indicator.name}
                            </label>
                            <Input
                              // @ts-expect-error not sure how to solve this dynamic typing
                              {...register(`coefficients.${indicator.nameCode}`)}
                              type="number"
                              step={0.001}
                              min={0}
                              defaultValue={0}
                              error={errors?.coefficients?.[indicator.nameCode]?.message}
                              unit={indicator.unit.symbol}
                              data-testid={`${indicator.nameCode}-input`}
                              disabled={indicator.status === 'inactive'}
                            />
                          </div>
                        ))}
                      </div>
                    </Disclosure.Panel>
                  </div>
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
          <Link href={`/data/scenarios/${scenarioId}/edit`} passHref>
            <Anchor variant="secondary">Cancel</Anchor>
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
