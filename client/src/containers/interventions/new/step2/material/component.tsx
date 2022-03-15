import { useMemo, useCallback, useState } from 'react';

// hooks
import { useMaterials } from 'hooks/materials';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/select';

// types
import { SelectOptions, SelectOption } from 'components/select/types';

const Material = ({ register }) => {
  const { data: materials, isLoading: isLoadingMaterials } = useMaterials();
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
    (key: string, value: string | number) =>
      setFormData({
        ...formData,
        [key]: value,
      }),
    [formData],
  );

  return (
    <>
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
    </>
  );
};

export default Material;
