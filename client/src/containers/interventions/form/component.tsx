import { useMemo } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { RadioGroup } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import classNames from 'classnames';

import MaterialsSelect from 'containers/materials/select';
import BusinessUnitsSelect from 'containers/business-units/select';
import LocationsSelect from 'containers/locations/select';
import SuppliersSelect from 'containers/suppliers/select';
import Input from 'components/forms/input';
import Textarea from 'components/forms/textarea';
import { AnchorLink, Button } from 'components/button';

import InterventionTypeIcon from './intervention-type-icon';
import Years from './years';
import { InterventionTypes } from '../enums';

import type { Intervention } from 'containers/scenarios/types';

type InterventionFormProps = {
  isSubmitting?: boolean;
  onSubmit?: (scenario: Intervention) => void;
};

const addressRegExp = /(\d{1,}) [a-zA-Z0-9\s]+(\.)? [a-zA-Z]+(\,)? [A-Z]{2} [0-9]{5,6}/;
const coordinatesRegExp = /^[-]?\d+[\.]?\d*, [-]?\d+[\.]?\d*$/;
const cityRegExp = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;

const schemaValidation = yup.object({
  title: yup.string().min(2),
  description: yup.string(),
  type: yup.string().required(),
  scenarioId: yup.string().required(),
  startYear: yup.number().required(),
  endYear: yup.number().required(),
  percentage: yup.number().required(),

  // Filters
  materialIds: yup.array().required(),
  businessUnitIds: yup.array(),
  supplierIds: yup.array(),
  adminRegionIds: yup.array().required(),

  // Supplier
  newT1Supplier: yup.string(),
  newProducerId: yup.string(),

  // Location
  newLocationType: yup
    .string()
    .matches(/(aggregation point|point of production|country of production)/),
  newLocationCountryInput: yup.string().required(),
  newLocationAddressInput: yup.string(),
  newLocationLatitude: yup.number(),
  newLocationLongitude: yup.number(),

  // Material
  newMaterialId: yup.string(),
  newMaterialTonnageRatio: yup.number(),

  // Coefficients
  DF_LUC_T: yup.number().required(),
  UWU_T: yup.number().required(),
  BL_LUC_T: yup.number().required(),
  GHG_LUC_T: yup.number().required(),
});

const LABEL_CLASSNAMES = 'text-sm';

const TYPES_OF_INTERVENTIONS = Object.values(InterventionTypes).map((interventionType) => ({
  value: interventionType,
  label: interventionType,
}));

const InterventionForm: React.FC<InterventionFormProps> = ({ isSubmitting, onSubmit }) => {
  const {
    handleSubmit,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const currentMaterialIds = watch('materialIds');
  const currentBusinessUnitIds = watch('businessUnitIds');
  const currentLocationIds = watch('adminRegionIds');
  const currentSupplierIds = watch('supplierIds');
  const currentInterventionType = watch('interventionType');

  console.log('values: ', getValues());

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6">
      <div className="flex flex-col justify-center">
        <h2>1. Apply intervention to...</h2>
        <p className="text-sm">
          Choose to which data of your supply chain you want to apply the intervention in order to
          analyze changes.
        </p>
      </div>
      <div className="space-y-4">
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
          {/* <Years /> */}
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <h2>2. Type of intervention</h2>
      </div>
      <div>
        <Controller
          name="interventionType"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field} onChange={(value) => setValue('interventionType', value)}>
              <RadioGroup.Label className="sr-only">Type of intervention</RadioGroup.Label>
              <div className="space-y-4 my-8">
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
          <div className="flex flex-col justify-center">
            <h2>3. Set up intervention</h2>
          </div>
          {/* Those options depending on intervention type selected by the user */}

          <div className="space-y-4">
            {currentInterventionType === InterventionTypes.Material && (
              <>
                <div>
                  <label className={LABEL_CLASSNAMES}>
                    New material <sup>*</sup>
                  </label>
                </div>
                <div>
                  <label className={LABEL_CLASSNAMES}>Tons of material per ton</label>
                </div>
              </>
            )}
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
