import type { FC } from 'react';
import { useState, useCallback } from 'react';

// components
import Checkbox from 'components/forms/checkbox';
import Input from 'components/forms/input';
import Label from 'components/forms/label';

// hooks
import { useFormContext } from 'react-hook-form';
import { useAppSelector } from 'store/hooks';
import { useMetadataInterventionsInfo } from 'hooks/metadata-info';

import { scenarios } from 'store/features/analysis';

// containers
import InfoTooltip from 'containers/info-tooltip';
import { useInterventionsIndicators } from 'hooks/interventions';
import { Hint } from 'components/forms';

const Step2: FC = () => {
  const [landgriffonEstimates, setLandgriffonEstimates] = useState(true);

  const { data } = useInterventionsIndicators();
  const { newInterventionData } = useAppSelector(scenarios);
  const { type } = newInterventionData;

  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const handleValues = useCallback(() => {
    setLandgriffonEstimates(!landgriffonEstimates);
    setValue('landgriffonEstimates', !landgriffonEstimates);
    data.map(({ id, value }) => setValue(id, value));
  }, [landgriffonEstimates, setLandgriffonEstimates, data, setValue]);

  const { impacts } = useMetadataInterventionsInfo();

  return (
    <>
      <fieldset className="sm:col-span-3 text-sm mt-8">
        <legend className="flex font-medium leading-5">
          <span className="mr-2.5">Supplier impacts per ton</span>
          <InfoTooltip info={impacts} />
        </legend>
        {type !== 'Change production efficiency' && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <Checkbox
                {...register('landgriffonEstimates')}
                id="landgriffon_estimates"
                name="landgriffon_estimates"
                onChange={handleValues}
                defaultChecked={true}
              />
              <Label htmlFor="landgriffon_estimates" className="ml-2 mt-1">
                Use LandGriffon location-based estimates.
              </Label>
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          {data.map((indicator) => (
            <div key={indicator.name}>
              <Label htmlFor={indicator.name} key={indicator.id}>
                {indicator.name}
              </Label>
              <Input
                {...register(indicator.id)}
                type="number"
                unit={indicator.unit}
                defaultValue={landgriffonEstimates ? indicator.value : null}
                disabled={landgriffonEstimates}
                error={errors?.[indicator.id]}
                showHint={false}
              />
              {type === 'Change production efficiency' && (
                <Hint>
                  Current value {indicator.value} {indicator.unit}
                </Hint>
              )}
            </div>
          ))}
        </div>
      </fieldset>
    </>
  );
};

export default Step2;
