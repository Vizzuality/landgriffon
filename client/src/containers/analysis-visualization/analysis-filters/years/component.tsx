import { Fragment, useState } from 'react'
import { Popover, Transition, Listbox, RadioGroup } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'
import classNames from 'classnames';

const options = [
  {
    id: 'single-year',
    name: 'Single year',
  },
  {
    id: 'year-range',
    name: 'Year range',
  }
]

const availableYears = [
  {
   id: 'select-year',
   value: 'select year',
   disabled: true,
   projected: false,
  },
  {
   id: '2019',
   value: '2019',
   disabled: false,
   projected: false,
  },
  {
   id: '2020',
   value: '2020',
   disabled: false,
   projected: false,
  },
  {
   id: '2021',
   value: '2021',
   disabled: false,
   projected: true,
  },
  {
   id: '2022',
   value: '2022',
   disabled: false,
   projected: true,
  },
  {
   id: '2023',
   value: '2023',
   disabled: false,
   projected: true,
  },
]

const YearsFilter: React.FC = () =>  {
  const [selectedOption, setSelectedOption] = useState(options[0])
  const [
    singleSelected,
    setSingleSelected,
    fromSelected,
    setFromSelect,
    toSelected,
    setToSelected,
  ] = useState(availableYears[0])

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm"
          >
            <span className="block truncate">AÑOZ</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              {open ?
                <ChevronUpIcon className="h-5 w-5 text-gray-900" aria-hidden="true" /> :
                <ChevronDownIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
              }
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

                  <RadioGroup value={selectedOption} onChange={setSelectedOption}>
                    {/* TODO: inga: ponemos lo que nos parece? */}
                    <RadioGroup.Label className="sr-only">Select single year or year range</RadioGroup.Label>
                    <div className="">
                      <RadioGroup.Option
                        key="single-year"
                        value="single-year"
                        className="relative flex flex-col my-4 cursor-pointer focus:outline-none"
                      >
                        {({ active, checked }) => (
                          <>
                            <div className="flex">
                              <span
                                className={classNames(
                                  checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
                                  active ? 'ring-2 ring-offset-2 ring-indigo-500' : '',
                                  'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center'
                                )}
                                aria-hidden="true"
                              >
                                <span className="rounded-full bg-white w-1.5 h-1.5" />
                              </span>
                              <div className="ml-2 flex flex-col">
                                <RadioGroup.Label
                                  as="span"
                                  className={classNames(checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium')}
                                >
                                  Single year
                                </RadioGroup.Label>
                              </div>
                            </div>
                            <Listbox value={singleSelected} onChange={setSingleSelected}>
                              {({ open }) => (
                                <div className="mt-2">
                                  <Listbox.Label className="sr-only">Impact indicators</Listbox.Label>
                                  <div className="w-full relative">
                                    <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm">
                                      <span className="block truncate">
                                        {singleSelected.value}
                                        {singleSelected.projected &&
                                          <span className='ml-2 text-2xs text-gray-400 italic'>
                                            projected data
                                          </span>
                                        }
                                        </span>
                                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        {open ?
                                          <ChevronUpIcon className="h-5 w-5 text-gray-900" aria-hidden="true" /> :
                                          <ChevronDownIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
                                        }
                                      </span>
                                    </Listbox.Button>

                                    <Transition
                                      show={open}
                                      as={Fragment}
                                      leave="transition ease-in duration-100"
                                      leaveFrom="opacity-100"
                                      leaveTo="opacity-0"
                                    >
                                      <Listbox.Options
                                        static
                                        className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                                      >
                                        {availableYears.map((year) => (
                                          <Listbox.Option
                                            key={year.id}
                                            className={({ active, selected }) =>
                                              classNames(
                                                active ? 'text-white bg-green-50 text-green-700' : 'text-gray-900',
                                                selected && 'bg-green-50',
                                                'cursor-default select-none relative py-2 pl-3 pr-9 flex'
                                              )
                                            }
                                            value={year}
                                            disabled={year.disabled}
                                          >
                                            {({ selected }) => (
                                              <>
                                                <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block')}>
                                                  {year.value}
                                                </span>
                                                {year.projected &&
                                                  <span className='ml-2 text-2xs text-gray-400 italic'>
                                                    projected data
                                                  </span>
                                                }
                                              </>
                                            )}
                                          </Listbox.Option>
                                        ))}
                                      </Listbox.Options>
                                    </Transition>
                                  </div>
                                </div>
                              )}
                            </Listbox>
                          </>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option
                        key="year-range"
                        value="year-range"
                        className="relative flex my-4 cursor-pointer focus:outline-none"
                      >
                        {({ active, checked }) => (
                          <>
                            <span
                              className={classNames(
                                checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
                                active ? 'ring-2 ring-offset-2 ring-indigo-500' : '',
                                'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center'
                              )}
                              aria-hidden="true"
                            >
                              <span className="rounded-full bg-white w-1.5 h-1.5" />
                            </span>
                            <div className="ml-2 flex flex-col">
                              <RadioGroup.Label
                                as="span"
                                className={classNames(checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium')}
                              >
                              Year range
                              </RadioGroup.Label>
                            </div>
                          </>
                        )}
                      </RadioGroup.Option>
                    </div>
                  </RadioGroup>




                  {/* <div>
                    <div className="py-4 flex-shrink-0 flex items-top justify-start">
                      <span
                        className={classNames(
                          // TODO: FALSE should be CHECKED
                          false ? 'bg-green-700 border-transparent' : 'bg-white border-gray-200',
                          'h-4 w-4 mt-0.5 mr-2 cursor-pointer rounded-full border flex items-center justify-center'
                        )}
                        aria-hidden="true"
                      >
                        <span className="rounded-full bg-white w-1.5 h-1.5" />
                      </span>
                      <span className="text-sm text-gray-800">Single year</span>
                    </div>
                    <div className="">
                      <Listbox value={singleSelected} onChange={setSingleSelected}>
                        {({ open }) => (
                          <>
                            <Listbox.Label className="sr-only">Impact indicators</Listbox.Label>
                            <div className="w-full relative">
                              <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm">
                                <span className="block truncate">{singleSelected.value}</span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                  {open ?
                                    <ChevronUpIcon className="h-5 w-5 text-gray-900" aria-hidden="true" /> :
                                    <ChevronDownIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
                                  }
                                </span>
                              </Listbox.Button>

                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options
                                  static
                                  className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                                >
                                  {availableYears.map((year) => (
                                    <Listbox.Option
                                      key={year.id}
                                      className={({ active, selected }) =>
                                        classNames(
                                          active ? 'text-white bg-green-50 text-green-700' : 'text-gray-900',
                                          selected && 'bg-green-50',
                                          'cursor-default select-none relative py-2 pl-3 pr-9 flex'
                                        )
                                      }
                                      value={year}
                                      disabled={year.disabled}
                                    >
                                      {({ selected }) => (
                                        <>
                                          <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block')}>
                                            {year.value}
                                          </span>
                                          {year.projected &&
                                            <span className='ml-2 text-2xs text-gray-400 italic'>
                                              projected data
                                            </span>
                                          }
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>
                    </div>
                  </div> */}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

export default YearsFilter;
