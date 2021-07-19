import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'

const groups = [
  { id: 1, name: 'Material' },
  { id: 2, name: 'Business Unit' },
  { id: 3, name: 'Region' },
  { id: 4, name: 'Supplier' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const GroupBy: React.FC = () =>  {
  const [selected, setSelected] = useState(groups[0])

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          {/* TODO: Proper Label */}
          <Listbox.Label className="sr-only">Group by</Listbox.Label>
          <div className="w-full relative">
            <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm">
              <div className="flex items-center">
                <span className="text-gray-500 mr-1">by</span>
                <span className="truncate">{selected.name.toLowerCase()}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {open ?
                    <ChevronUpIcon className="h-5 w-5 text-gray-900" aria-hidden="true" /> :
                    <ChevronDownIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
                  }
                </span>
              </div>
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
                // had `w-full` before
                className="absolute z-10 mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              >
                {groups.map((group) => (
                  <Listbox.Option
                    key={group.id}
                    className={({ active, selected }) =>
                      classNames(
                        active ? 'text-white bg-green-50 text-green-700' : 'text-gray-900',
                        selected && 'bg-green-50',
                        'cursor-default select-none relative py-2 pl-3 pr-9'
                      )
                    }
                    value={group}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? 'font-semibold' : 'font-normal',
                            'block truncate'
                          )}
                        >
                          {group.name}
                        </span>
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
  );
}

export default GroupBy;
