import { useMemo, useState, FC } from 'react';

// components
import Checkbox from 'components/forms/checkbox';
import Input from 'components/forms/input';
import Label from 'components/forms/label';

// hooks
import { useFormContext } from 'react-hook-form';

// containers
import InfoTooltip from 'containers/info-tooltip';

interface Indicator {
  name: string;
  value: number;
  description: string;
  id: string;
  metadata: unknown;
  unit: string;
}

const Step2: FC = () => {
  const [landgriffonEstimates, setLandgriffonEstimates] = useState(false);
  // const { data: indicators, isFetching, isFetched, error } = useIndicators();

  const data = useMemo<Indicator[]>(
    () => [
      {
        description:
          'The different terrestrial ecosystems play an important role storing carbon on the below-ground plant organic matter and soil. Particularly forest, through growth of trees and the increase of soil carbon, contain a large part of the carbon stored on land.\n\nActivities such us land use change or deforestation may affect carbon storage producing a disturbance of the carbon pools that may be released into the atmosphere.\n\nCarbon emissions due to land use change would therefore be the release of carbon into the atmosphere driven by the change from forest into a specific agriculture commodity.',
        id: 'GHG_LUC_T',
        metadata: {},
        name: 'Carbon emissions',
        value: 0,
        unit: 'tCO2e',
      },
      {
        description: 'Deforestation risk due to ...',
        id: 'DF_LUC_T',
        metadata: {},
        name: 'Deforestation risk',
        value: 0,
        unit: 'Ha',
      },
      {
        description: 'With the Unsustainable water use indicator...',
        id: 'UWU_T',
        metadata: {},
        name: 'Water withdrawal',
        value: 0,
        unit: '100m3',
      },
      {
        description: 'Land use and land use change...',
        id: 'BL_LUC_T',
        metadata: {},
        name: 'Biodiversity impact',
        value: 0,
        unit: 'PDF',
      },
    ],
    [],
  );

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
