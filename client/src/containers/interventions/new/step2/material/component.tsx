import { useMemo, useCallback, useState } from 'react';

// hooks
import { useMaterials } from 'hooks/materials';
import { useAppDispatch } from 'store/hooks';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/select';

// form validation
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// types
import { SelectOptions, SelectOption } from 'components/select/types';
import { setNewInterventionData } from 'store/features/analysis/scenarios';

const schemaValidation = yup.object({
  materialTons: yup.number().required('Tones are required'),
  material: yup.array().min(1).required('Select material'),
});

const Material = () => {
  const { data: materials, isLoading: isLoadingMaterials } = useMaterials();
  const dispatch = useAppDispatch();
  const optionsMaterials: SelectOptions = useMemo(
    () =>
      materials.map((material) => ({
        label: material.name,
        value: material.id,
      })),
    [],
  );

  const [formData, setFormData] = useState({
    material: materials[0]?.id,
  });

  const currentMaterial = useMemo<SelectOption>(
    () => optionsMaterials?.find((option) => option.value === formData.material),
    [optionsMaterials, formData.material],
  );

  const onChange = useCallback(
    (e) => {
      dispatch(setNewInterventionData(e))
      },
      // setFormData({
      //   ...formData,
      //   [key]: value,
      // }),
    [dispatch],
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  return (
    <form>
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="font-medium leading-5">New material</legend>

        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            <Label className="mb-1">Material</Label>

            <Select
              id="material"
              {...register('material', { value: formData.material })}
              loading={isLoadingMaterials}
              current={currentMaterial}
              options={optionsMaterials}
              placeholder="Select"
              onChange={onChange}
              fitContent
            />

          </div>

          <div className="block font-medium text-gray-700">
            <Label htmlFor="materialTons" className="mb-1">
              Tons of new material per ton
            </Label>
            <Input
              {...register('materialTons')}
              type="number"
              name="materialTons"
              id="materialTons"
              aria-label="material tons"
              placeholder="0"
              defaultValue={0}
            />
          </div>
        </div>
      </fieldset>
    </form>
  );
};

export default Material;
