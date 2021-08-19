import { Fragment, useCallback, useState, useEffect } from 'react';
import type { UseQueryResult } from 'react-query';
import { Select } from 'antd';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';

import classNames from 'classnames';

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
  const { data, isLoading, error } = years;

  const availableYears = (data && data.data) || [];

  const isDisabled = error || availableYears.length === 0;

  useEffect(() => {
    if (!isLoading && availableYears) {
      setValue(availableYears[0]);
      setValueEnd(availableYears[0]);
    }
  }, [availableYears, isLoading]);

  const handleChange = useCallback((currentValue) => {
    setValue(currentValue);
  }, []);

  const handleChangeEnd = useCallback((currentValue) => {
    setValueEnd(currentValue);
  }, []);

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          {/* TODO: Improve disabled */}
          <Popover.Button
            {...(isDisabled ? { disabled: true } : {})}
            className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm"
          >
            <span className="block h-5 truncate">
              <span className="text-gray-600 mr-1">{isRange ? 'from' : 'in'}</span>
              <span>{isRange ? `${value}-${valueEnd}` : value}</span>
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
            <Popover.Panel className="absolute w-60 z-10 mt-1">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative rounded-lg bg-white p-4">
                  <div className="text-sm text-gray-500">Year</div>
                  <div
                    className={classNames(
                      'grid',
                      isRange ? 'grid-cols-2' : 'grid-cols-1',
                      'gap-2 mt-2'
                    )}
                  >
                    <Select
                      defaultValue={value}
                      onChange={handleChange}
                      value={value}
                      dropdownStyle={{ minWidth: 'min-content' }}
                      suffixIcon={<ChevronDownIcon />}
                    >
                      {availableYears.map((year) => (
                        <Select.Option key={`year-${year}`} value={year}>
                          <span>{year}</span>
                          {/* TODO: projected? */}
                          {year > 2020 && (
                            <span className="text-2xs text-gray-400 italic ml-2 truncate">
                              projected year
                            </span>
                          )}
                        </Select.Option>
                      ))}
                    </Select>
                    {isRange && (
                      <Select
                        defaultValue={valueEnd}
                        onChange={handleChangeEnd}
                        dropdownStyle={{ minWidth: 'min-content' }}
                        suffixIcon={<ChevronDownIcon />}
                      >
                        {availableYears.map((year) => (
                          <Select.Option key={`year-${year}`} value={year}>
                            <span>{year}</span>
                            {/* TODO: projected? */}
                            {year > 2020 && (
                              <span className="text-2xs text-gray-400 italic ml-2">
                                projected year
                              </span>
                            )}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default YearsFilter;
