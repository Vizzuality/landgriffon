import { Fragment, useCallback, useState, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import { useYears } from 'lib/hooks/years';

import { Select } from 'antd';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';

import { toNumber, isFinite } from 'lodash';

type YearsFilterProps = {};

const YearsFilter: React.FC<YearsFilterProps> = () => {
  const [additionalYear, setAdditionalYear] = useState();

  const { visualizationMode, filters } = useAppSelector(analysis);
  const dispatch = useAppDispatch();

  const { data, isLoading, error } = useYears();

  const availableYears = (data && data.data) || [];

  const isDisabled = error || availableYears.length === 0;

  useEffect(() => {
    if (!isLoading && availableYears) {
      dispatch(
        setFilter({
          id: 'startYear',
          value: availableYears[0],
        })
      );

      if (availableYears.length > 1) {
        dispatch(
          setFilter({
            id: 'endYear',
            value: availableYears[availableYears.length - 1],
          })
        );
      }
    }
  }, [availableYears, isLoading]);

  const handleChange = useCallback((currentValue) => {
    dispatch(
      setFilter({
        id: 'startYear',
        value: currentValue,
      })
    );
  }, []);

  const handleChangeEnd = useCallback((currentValue) => {
    dispatch(
      setFilter({
        id: 'endYear',
        value: currentValue,
      })
    );
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
          {visualizationMode === 'map' && (
            <Select
              // defaultValue={valueEnd}
              onChange={handleChangeEnd}
              value={filters.endYear}
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
          {visualizationMode !== 'map' && (
            <>
              <Popover.Button
                {...(isDisabled ? { disabled: true } : {})}
                className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm"
              >
                <span className="block h-5 truncate">
                  <span className="mr-1 text-gray-600">from</span>
                  <span>
                    {filters.startYear}-{filters.endYear}
                  </span>
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {open ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
                  )}
                </span>
              </Popover.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Popover.Panel className="absolute z-20 mt-1 w-60">
                  <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="relative p-4 bg-white rounded-lg">
                      <div className="grid grid-cols-1 gap-2">
                        <div>From</div>
                        <Select
                          onChange={handleChange}
                          value={filters.startYear}
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
                          onChange={handleChangeEnd}
                          value={filters.endYear}
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
