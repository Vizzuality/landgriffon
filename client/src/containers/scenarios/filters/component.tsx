import type { FC } from 'react';
import {
  // Fragment,
  useCallback,
  // useEffect,
  // useState,
  useMemo,
} from 'react';
import { SearchIcon } from '@heroicons/react/solid';
// import { Transition } from '@headlessui/react';

// import classNames from 'classnames';
import Select from 'components/select';
// import { useAppSelector } from 'store/hooks';
// import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store/hooks';
import {
  scenarios,
  // setScenarioFilter,
  setSort,
  setSearchTerm,
} from 'store/features/analysis/scenarios';
import { useDispatch } from 'react-redux';

const SORT_OPTIONS = [
  {
    label: 'Recent',
    value: '-updatedAt',
  },
  {
    label: 'Title',
    value: 'title',
  },
];

// const filtersItems = [
//   {
//     name: 'All',
//     filter: 'all',
//   },
//   {
//     name: 'My scenarios',
//     filter: 'private',
//   },
//   {
//     name: 'Shared',
//     filter: 'public',
//   },
// ];

const ScenariosFilters: FC = () => {
  const dispatch = useDispatch();
  // const handleFilter = useCallback((value) => dispatch(setScenarioFilter(value)), [dispatch]);
  // const [isSearchEnable, setSearchEnable] = useState(false);
  // const toggleSearch = useCallback(() => setSearchEnable(!isSearchEnable), [isSearchEnable]);

  const {
    // filter,
    sort,
  } = useAppSelector(scenarios);

  const handleSort = useCallback((selected) => dispatch(setSort(selected.value)), [dispatch]);
  const handleSearchByTerm = useCallback(
    (event) => dispatch(setSearchTerm(event.currentTarget.value)),
    [dispatch],
  );

  const currentSort = useMemo(() => SORT_OPTIONS.find(({ value }) => value === sort), [sort]);

  return (
    <div className="flex items-center">
      <div className="relative flex items-center">
        {/* <button type="button" onClick={toggleSearch}> */}
        <SearchIcon className="w-4 h-4" />
        {/* </button> */}
        {/* {isSearchEnable && (
          <Transition
            as={Fragment}
            enter="transition-opacity ease-linear duration-700"
            enterFrom="-left-10"
            enterTo="left-0"
            leave="transition-opacity ease-linear duration-700"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          > */}
        <input
          id="search"
          name="search"
          placeholder="Search"
          className="flex-1 ml-1 appearance-none text-sm text-green-700 border-0 border-b-2 border-white focus:border-0 focus:border-b-2 px-0 py-0 focus:outline-none focus:border-green-700 focus:ring-0 max-w-[86px]"
          type="search"
          onChange={handleSearchByTerm}
        />
        {/* </Transition>
         )} */}
      </div>
      {/*
      <ul className="relative flex flex-1 space-x-2 ml-3 justify-start whitespace-nowrap items-center">
        {filtersItems.map((item) => (
          <li key={item.filter}>
            <button
              className={classNames(
                'block',
                filter === item.filter
                  ? 'border-b-2 border-green-700 box-content text-gray-900'
                  : 'text-gray-500',
              )}
              onClick={() => handleFilter(item.filter)}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>  TO DO - unhide when API gets ready */}

      <div className="absolute right-0 bg-white z-10 pl-5">
        <Select
          theme="default-bordernone"
          current={currentSort}
          options={SORT_OPTIONS}
          onChange={handleSort}
        />
      </div>
    </div>
  );
};

export default ScenariosFilters;
