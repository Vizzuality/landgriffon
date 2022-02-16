import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SearchIcon, XIcon } from '@heroicons/react/solid';
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

const ScenariosFilters = () => {
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
    <div className="flex items-center justify-between">
      {isSearchEnable ? (
        <div className="w-full sm:max-w-xs">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full py-2 pl-10 pr-3 text-sm placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm"
              placeholder="Search"
              type="search"
              onChange={handleSearchByTerm}
            />
          </div>
          <button type="button" onClick={toggleSearch}>
            <XIcon className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={toggleSearch}>
          <SearchIcon className="w-6 h-6" />
        </button>
      )}

      <ul className="flex space-x-2">
        <li>
          <Link href={{ pathname: '/analysis', query: { ...query, filter: 'all' } }}>
            <a
              className={classNames('block border-b-2 border-white', {
                'border-green-700': query.filter === 'all' || !query.filter,
              })}
            >
              All
            </a>
          </Link>
        </li>
        <li>
          <Link href={{ pathname: '/analysis', query: { ...query, filter: 'my-scenarios' } }}>
            <a
              className={classNames('block border-b-2 border-white', {
                'border-green-700': query.filter === 'my-scenarios',
              })}
            >
              My scenarios
            </a>
          </Link>
        </li>
      </ul>

      <Select
        // styles={{ border: false }}
        theme=""
        current={SORT_OPTIONS[0]}
        options={SORT_OPTIONS}
        onChange={handleSort}
      />
    </div>
  );
};

export default ScenariosFilters;
