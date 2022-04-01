import { useState, FC } from 'react';

// components
import Checkbox from 'components/forms/checkbox';
import Input from 'components/forms/input';
import Label from 'components/forms/label';

// hooks
import { useFormContext } from 'react-hook-form';

// containers
import InfoTooltip from 'containers/info-tooltip';
import { useInterventionsIndicators } from 'hooks/interventions';

const Step2: FC = () => {
  const [landgriffonEstimates, setLandgriffonEstimates] = useState(false);
  // const { data: indicators, isFetching, isFetched, error } = useInterventionsIndicators();

  const { data } = useInterventionsIndicators();
  const indicatorsValues = () =>
    data.reduce(
      (obj, indicator) => ({
        ...obj,
        [indicator.name]: indicator.value,
      }),
      {},
    );

  const { register } = useFormContext();

  return (
    <>
      <fieldset className="sm:col-span-3 text-sm mt-8">
        <legend className="flex font-medium leading-5">
          Supplier impacts per tone
          <InfoTooltip className="ml-2" />
        </legend>
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center">
            <Checkbox
              id="landgriffon_estimates"
              name="landgriffon_estimates"
              onChange={() => setLandgriffonEstimates(!landgriffonEstimates)}
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
                value={landgriffonEstimates ? indicator.value : indicatorsValues[indicator.name]}
                disabled={landgriffonEstimates}
              />
            </div>
          ))}
        </div>
      </fieldset>
    </>
  );
};

export default Step2;
