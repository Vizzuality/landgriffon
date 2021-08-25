import { Fragment, useCallback, useState, useEffect } from 'react';
import type { UseQueryResult } from 'react-query';
import { Select } from 'antd';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { toNumber, isFinite } from 'lodash';

type YearsFilterProps = {
  years: {
    data: {
      data: number[];
    };
    isLoading: UseQueryResult['isLoading'];
    error: UseQueryResult['error'];
  };
  isRange: boolean;
};

const YearsFilter: React.FC<YearsFilterProps> = ({ years, isRange }: YearsFilterProps) => {
  const [value, setValue] = useState(null);
  const [valueEnd, setValueEnd] = useState(null);
  const [additionalYear, setAdditionalYear] = useState();
  const { data, isLoading, error } = years;

  const availableYears = (data && data.data) || [];

  const isDisabled = error || availableYears.length === 0;

  useEffect(() => {
    if (!isLoading && availableYears) {
      setValue(availableYears[0]);

      if (availableYears.length > 1) {
        setValueEnd(availableYears[1]);
      } else {
        setValueEnd(availableYears[0]);
      }
    }
  }, [availableYears, isLoading]);

  const handleChange = useCallback((currentValue) => {
    console.log('valueEnd:', valueEnd);
    console.log('currentValue:', currentValue);

    if (valueEnd) {
      if (currentValue < valueEnd) setValue(currentValue);
    } else {
      setValue(currentValue);
    }
  }, []);

  const handleChangeEnd = useCallback((currentValue) => {
    console.log('value:', value);
    console.log('currentValue:', currentValue);

    if (value) {
      if (currentValue > value) setValueEnd(currentValue);
    } else {
      setValueEnd(currentValue);
    }
  }, []);

  const handleOnSearch = (e) => {
    if (!isFinite(toNumber(e))) return;
    if (toNumber(e) <= availableYears[0]) return;

    let exists = false;

    availableYears.forEach((y) => {
      if (y.toString().indexOf(e) >= 0) exists = true;
    });

    if (!exists) setAdditionalYear(e);
  };

  const handleOnBlur = () => {
    setAdditionalYear(null);
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          {!isRange && (
            <Select
              defaultValue={valueEnd}
              onChange={handleChangeEnd}
              value={valueEnd}
              optionLabelProp="label"
              className="w-28"
              suffixIcon={<ChevronDownIcon />}
              showSearch
              onSearch={handleOnSearch}
              onBlur={handleOnBlur}
            >
              {availableYears.map((year) => (
                <Select.Option
                  key={`year-${year}`}
                  value={year}
                  label={
                    <>
                      <span className="text-gray-500">in</span> {year}
                    </>
                  }
                >
                  {year}
                </Select.Option>
              ))}
              {additionalYear && (
                <Select.Option
                  key={`new-year-${additionalYear}`}
                  value={additionalYear}
                  label={
                    <>
                      <span className="text-gray-500">in</span> {additionalYear}
                    </>
                  }
                >
                  {additionalYear}
                </Select.Option>
              )}
            </Select>
          )}
          {isRange && (
            <>
              <Popover.Button
                {...(isDisabled ? { disabled: true } : {})}
                className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm"
              >
                <span className="block h-5 truncate">
                  <span className="text-gray-600 mr-1">from</span>
                  <span>
                    {value}-{valueEnd}
                  </span>
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {open ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
                  )}
                </span>
              </Popover.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Popover.Panel className="absolute w-60 z-20 mt-1">
                  <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="relative rounded-lg bg-white p-4">
                      <div className="grid grid-cols-1 gap-2">
                        <div>From</div>
                        <Select
                          defaultValue={value}
                          onChange={handleChange}
                          value={value}
                          dropdownStyle={{ minWidth: 'min-content' }}
                          suffixIcon={<ChevronDownIcon />}
                          showSearch
                        >
                          {availableYears.map((year) => (
                            <Select.Option key={`year-${year}`} value={year}>
                              <span>{year}</span>
                            </Select.Option>
                          ))}
                        </Select>
                        <div>To</div>
                        <Select
                          defaultValue={valueEnd}
                          onChange={handleChangeEnd}
                          value={valueEnd}
                          suffixIcon={<ChevronDownIcon />}
                          showSearch
                          onSearch={handleOnSearch}
                          onBlur={handleOnBlur}
                        >
                          {availableYears.map((year) => (
                            <Select.Option key={`year-${year}`} value={year}>
                              {year}
                            </Select.Option>
                          ))}
                          {additionalYear && (
                            <Select.Option
                              key={`new-year-${additionalYear}`}
                              value={additionalYear}
                            >
                              {additionalYear}
                            </Select.Option>
                          )}
                        </Select>
                      </div>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </>
      )}
    </Popover>
  );
};

export default YearsFilter;
