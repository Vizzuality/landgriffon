import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SearchIcon } from '@heroicons/react/solid';
import { Transition } from '@headlessui/react';
import { useDebounce } from '@react-hook/debounce';

import classNames from 'classnames';
import Select from 'components/select';

const SORT_OPTIONS = [
  {
    label: 'Recent',
    value: 'updatedAt',
  },
  {
    label: 'Title',
    value: 'title',
  },
];

const filtersItems = [
  {
    name: 'All',
    filter: 'all',
  },
  {
    name: 'My scenarios',
    filter: 'userId',
  },
  {
    name: 'Shared',
    filter: 'status',
  },
];

const ScenariosFilters: FC = () => {
  const router = useRouter();
  const { query } = router;
  const [isSearchEnable, setSearchEnable] = useState(false);
  const [term, setTerm] = useDebounce(null, 250); // wait 250ms before set term
  const toggleSearch = useCallback(() => setSearchEnable(!isSearchEnable), [isSearchEnable]);
  const handleSort = useCallback(
    (selected) =>
      router.replace({
        pathname: '/analysis',
        query: {
          ...query,
          sortBy: selected.value,
        },
      }),
    [],
  );
  const handleSearchByTerm = useCallback((event) => setTerm(event.currentTarget.value), []);

  useEffect(() => {
    if (term) {
      router.replace({
        pathname: '/analysis',
        query: {
          ...query,
          term,
        },
      });
    }
  }, [term]);

  return (
    <div className="flex items-center">
      <div
        className={classNames(
          'relative w-full',
          isSearchEnable ? 'sm:max-w-[100px]' : 'sm:max-w-[20px]',
        )}
      >
        <button
          type="button"
          onClick={toggleSearch}
          className="absolute top-1/2 transform -translate-y-1/2 left-0"
        >
          <SearchIcon className="w-4 h-4" />
        </button>
        {isSearchEnable && (
          <Transition
            as={Fragment}
            enter="transition-opacity ease-linear duration-700"
            enterFrom="-left-10"
            enterTo="left-0"
            leave="transition-opacity ease-linear duration-700"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <input
              id="search"
              name="search"
              placeholder="Search"
              className="absolute top-1/2 w-20 transform -translate-y-1/2 left-6 appearance-none text-sm text-green-700 font-bold border-0 border-b-2 border-green-700 px-0 py-0 focus:outline-none focus:border-green-700 focus:ring-0"
              type="search"
              onChange={handleSearchByTerm}
            />
          </Transition>
        )}
      </div>

      <ul className="relative flex flex-1 space-x-2 ml-3 justify-start whitespace-nowrap items-center">
        {filtersItems.map((item) => (
          <li key={item.filter}>
            <Link href={{ pathname: '/analysis', query: { ...query, filter: item.filter } }}>
              <a
                className={classNames(
                  'block',
                  query.filter === item.filter || (!query.filter && item.filter === 'all')
                    ? 'border-b-2 border-green-700 box-content text-gray-900'
                    : 'text-gray-500',
                )}
              >
                {item.name}
              </a>
            </Link>
          </li>
        ))}
      </ul>

      <div className="">
        <Select
          theme="default-bordernone"
          current={SORT_OPTIONS[0]}
          options={SORT_OPTIONS}
          onChange={handleSort}
        />
      </div>
    </div>
  );
};

export default ScenariosFilters;
