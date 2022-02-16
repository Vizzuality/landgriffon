import { useMemo, useCallback, useState } from 'react';

import Select from 'components/select';

// types
import { SelectOptions, SelectOption } from 'components/select/types';

const MaterialForm = () => {
  const materials = ['mat1', 'mat2'];
  const material = 'mat11';

  const optionsMaterials: SelectOptions = useMemo(
    () => materials.map((material) => ({
      label: material,
      value: material,
    })), [materials]);

  const currentMaterial = useMemo<SelectOption>(
    () => optionsMaterials?.find((option) => option.value === material),
    [optionsMaterials]);

  const isLoadingMaterials = false;

  const onChange = useCallback((key: string, value: string | number) => {
    console.log('onChange filter')
  },
    [],
  );
  return (
    <>
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="font-medium leading-5">Material</legend>

        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
          <span>Material</span>
            <div className="mt-1">
              <Select
                loading={isLoadingMaterials}
                current={currentMaterial}
                options={optionsMaterials}
                placeholder="Select"
                onChange={() => onChange('material', currentMaterial.value)}
              />
            </div>
          </div>

          <label htmlFor="biodiversity_impact" className="block font-medium text-gray-700">
            Tons of new material per ton
            <div className="mt-1">
              <input
                type="text"
                name="biodiversity_impact"
                id="biodiversity_impact"
                autoComplete="given-biodiversity-impact"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
              />
            </div>
          </label>
        </div>
      </fieldset>
    </>
  );
};

export default MaterialForm;
