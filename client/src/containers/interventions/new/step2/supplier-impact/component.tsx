import { useState, FC, useCallback } from 'react';

// components
import Checkbox from 'components/forms/checkbox';
import Input from 'components/forms/input';
import Label from 'components/forms/label';

// hooks
import { useFormContext } from 'react-hook-form';

// containers
import InfoTooltip from 'containers/info-tooltip';
import { useInterventionsIndicators } from 'hooks/interventions';
import { Hint } from 'components/forms';

const Step2: FC = () => {
  const [landgriffonEstimates, setLandgriffonEstimates] = useState(false);

  const { data } = useInterventionsIndicators();

  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const handleValues = useCallback(() => {
    setLandgriffonEstimates(!landgriffonEstimates);
    data.map(({ id, value }) => setValue(id, value));
  }, [landgriffonEstimates, setLandgriffonEstimates, data, setValue]);

  return (
    <>
      <fieldset className="sm:col-span-3 text-sm mt-4">
        <legend className="flex font-medium leading-5">
          <span className="mr-2.5">Supplier impacts per tone</span>
          <InfoTooltip />
        </legend>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <Checkbox
              id="landgriffon_estimates"
              name="landgriffon_estimates"
              onChange={handleValues}
            />
            <Label htmlFor="landgriffon_estimates" className="ml-2 mt-1">
              Use LandGriffon location-based estimates.
            </Label>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
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
              <Hint>
                Current value {indicator.value} {indicator.unit}
              </Hint>
            </div>
          ))}
        </div>
      </fieldset>
    </>
  );
};

export default Step2;
