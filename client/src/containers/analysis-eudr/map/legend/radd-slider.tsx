import { useState } from 'react';
import { useDebounce } from 'rooks';
import { format } from 'date-fns';

import layersData from '../layers.json';

import { useAppDispatch } from '@/store/hooks';
import { setContextualLayer } from '@/store/features/eudr';
import { Slider } from '@/components/ui/slider';

const LAYERD_ID = 'real-time-deforestation-alerts-since-2020-radd';
const dateFormatter = (date: string) => format(date, 'yyyy MMM dd');

const RADDSlider = () => {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<number[]>([0, 0]);
  const data = layersData.find((layer) => layer.id === LAYERD_ID);
  const dates = data?.legend?.dates;
  const handleValueChange = useDebounce((valuesRange) => {
    dispatch(
      setContextualLayer({
        layer: LAYERD_ID,
        configuration: { dateFrom: dates[valuesRange[0]], dateTo: dates[valuesRange[1]] },
      }),
    );
  }, 1000);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 py-2 text-2xs text-gray-500">
        <div>From</div>
        <div className="rounded-sm border border-navy-400 px-2 py-1 text-navy-400">
          {dateFormatter(dates[values[0]])}
        </div>
        <div>to</div>
        <div className="rounded-sm border border-navy-400 px-2 py-1 text-navy-400">
          {dateFormatter(dates[values[1]])}
        </div>
      </div>
      <Slider
        defaultValue={[0, dates.length - 1]}
        value={values}
        min={0}
        max={dates.length - 1}
        step={1}
        className="mt-4"
        onValueChange={(values) => {
          setValues(values);
          handleValueChange(values);
        }}
        minStepsBetweenThumbs={1}
      />
      <div className="flex justify-between">
        {[dates[0], dates[dates.length - 1]].map((year) => (
          <div key={year} className="text-2xs text-gray-500">
            {year}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RADDSlider;
