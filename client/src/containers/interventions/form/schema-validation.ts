import * as yup from 'yup';

import { InterventionTypes, LocationTypes } from '../enums';

import { isCoordinates } from 'utils/coordinates';

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
  volume: yup.number().optional().typeError('Volume should be a number'),
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
    .required()
    .typeError('Start should be a number'),
  endYear: yup
    .object({
      label: yup.string(),
      value: yup.number(),
    })
    .label('End year')
    .optional()
    .typeError('Start should be a number'),
  percentage: yup
    .number()
    .label('Percentage')
    .moreThan(0)
    .max(100)
    .required()
    .typeError('Percentage should be a number greater than 0 and less or equal than 100'),
  scenarioId: yup.string().label('Scenario ID').required(),

  // Filters
  materialIds: yup.array().label('Material IDs').of(optionSchema).required(),
  businessUnitIds: yup.array().label('Business Unit IDs').of(optionSchema),
  t1SupplierIds: yup.array().label('T1 Supplier IDs').of(optionSchema),
  producerIds: yup.array().label('Producer IDs').of(optionSchema),
  adminRegionIds: yup.array().label('Admin region IDs').of(optionSchema),

  // Supplier
  newT1SupplierId: optionSchema.label('New T1 Supplier ID').required(),
  newProducerId: optionSchema.label('New producer ID').required(),

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
    })
    .typeError('Longitude should be a number'),
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
    })
    .typeError('Latitude should be a number'),

  // Coefficients
  coefficients: yup.lazy((coefficientObject = {}) => {
    const schema = Object.keys(coefficientObject).reduce(
      (prevValue, currentValue) => ({
        ...prevValue,
        [currentValue]: yup.lazy((v) => {
          if (v === '') return yup.string().required('This coefficient is required.');

          return yup.number().typeError('Coefficient should be a number');
        }),
      }),
      {},
    );
    return yup.object(schema);
  }),
});

export default schemaValidation;
