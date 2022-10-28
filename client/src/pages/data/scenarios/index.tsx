import { useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PlusIcon, SortDescendingIcon } from '@heroicons/react/solid';
import { useDebounceCallback } from '@react-hook/debounce';
import omit from 'lodash/omit';

import ListIcon from 'components/icons/list';
import GridIcon from 'components/icons/grid';
import ButtonGroup, { LinkGroupItem } from 'components/button-group';
import Select from 'components/forms/select';
import Search from 'components/search';
import { useScenarios } from 'hooks/scenarios';
import AdminLayout from 'layouts/data';
import ScenarioCard from 'containers/scenarios/card';
import { Anchor } from 'components/button';
import Loading from 'components/loading';

import type { ScenarioCardProps } from 'containers/scenarios/card/types';

const DISPLAY_OPTIONS: ScenarioCardProps['display'][] = ['grid', 'list'];

const displayClasses = {
  grid: 'grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3',
  list: 'space-y-6 mt-4',
};

const listColumnClasses = 'font-bold text-gray-400 uppercase';

const SORT_OPTIONS = [
  {
    label: 'Sort by most recent',
    value: '-updatedAt',
  },
  {
    label: 'Sort by name',
    value: 'title',
  },
];

const ScenariosAdminPage: React.FC = () => {
  const router = useRouter();
  const { query } = router;

  const handleSort = useCallback(
    ({ value }) => {
      router.replace(
        {
          pathname: router.pathname,
          query: {
            ...query,
            sortBy: value,
          },
        },
        null,
        { shallow: true },
      );
    },
    [router, query],
  );

  const handleSearchByTerm = useDebounceCallback((value) => {
    router.replace(
      {
        pathname: router.pathname,
        query: {
          ...omit(query, 'search'),
          ...(value !== '' && { search: value }),
        },
      },
      null,
      { shallow: true },
    );
  }, 250);

  const currentSort = useMemo(
    () => SORT_OPTIONS.find(({ value }) => value === query.sortBy) || SORT_OPTIONS[0],
    [query.sortBy],
  );

  const currentDisplay = useMemo(
    () => (query.display as ScenarioCardProps['display']) || 'grid',
    [query.display],
  );

  const searchTerm = useMemo(() => query.search || null, [query.search]);

  const { data, isLoading } = useScenarios({
    params: {
      disablePagination: true,
      sort: currentSort.value,
      'search[title]': searchTerm as string,
    },
    options: { select: (data) => data.data },
  });

  return (
    <AdminLayout title="Manage scenarios data">
      <Head>
        <title>Admin scenarios | Landgriffon</title>
      </Head>
      <div className="flex justify-between mb-6 space-x-4">
        <div className="w-full">
          <Search
            placeholder="Search by scenario name"
            defaultValue={searchTerm}
            onChange={handleSearchByTerm}
            data-testid="search-name-scenario"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <div className="flex space-x-2">
            <Select
              value={currentSort}
              options={SORT_OPTIONS}
              onChange={handleSort}
              icon={<SortDescendingIcon className="w-4 h-4" />}
              data-testid="sort-scenario"
            />
            <ButtonGroup>
              {DISPLAY_OPTIONS.map((display) => (
                <LinkGroupItem
                  key={display}
                  active={currentDisplay === display}
                  href={{ pathname: '/data/scenarios', query: { ...query, display } }}
                  data-testid={`scenario-display-${display}`}
                >
                  {display === 'grid' && <GridIcon className="w-6 h-6" aria-hidden="true" />}
                  {display === 'list' && <ListIcon className="w-6 h-6" aria-hidden="true" />}
                </LinkGroupItem>
              ))}
            </ButtonGroup>
          </div>
          <div>
            <Link href="/data/scenarios/new" passHref>
              <Anchor
                variant="secondary"
                data-testid="scenario-add-button"
                icon={
                  <div
                    aria-hidden="true"
                    className="flex items-center justify-center w-5 h-5 rounded-full bg-navy-400"
                  >
                    <PlusIcon className="w-4 h-4 text-white" />
                  </div>
                }
              >
                Add scenario
              </Anchor>
            </Link>
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="flex justify-center">
          <Loading className="w-5 h-5 text-navy-400" />
        </div>
      )}
      {currentDisplay === 'list' && (
        <div className="grid grid-cols-5 gap-4 mx-6">
          <div className={listColumnClasses}>Scenario</div>
          <div className={listColumnClasses}>Growth Rates</div>
          <div className={listColumnClasses}>Interventions</div>
          <div className={listColumnClasses}>Access</div>
        </div>
      )}
      <div className={displayClasses[currentDisplay]}>
        {!isLoading &&
          data?.map((scenarioData) => (
            <ScenarioCard
              key={`scenario-card-${scenarioData.id}`}
              data={scenarioData}
              display={currentDisplay}
            />
          ))}
      </div>
    </AdminLayout>
  );
};

export default ScenariosAdminPage;
