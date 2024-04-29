import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PlusIcon, SortDescendingIcon } from '@heroicons/react/solid';
import Lottie from 'lottie-react';
import classNames from 'classnames';
import toast from 'react-hot-toast';
import { dehydrate } from '@tanstack/react-query';

import { tasksSSR } from 'services/ssr';
import newScenarioAnimation from 'containers/scenarios/animations/new-scenario.json';
import ListIcon from 'components/icons/list';
import GridIcon from 'components/icons/grid';
import ButtonGroup, { LinkGroupItem } from 'components/button-group';
import Select from 'components/forms/select';
import Search from 'components/search';
import { useDeleteScenario, useScenarios } from 'hooks/scenarios';
import AdminLayout from 'layouts/admin';
import ScenarioCard from 'containers/scenarios/card';
import { Anchor } from 'components/button';
import Loading from 'components/loading';
import { usePermissions } from 'hooks/permissions';
import { Permission } from 'hooks/permissions/enums';
import ScenarioTable from 'containers/scenarios/table';
import DeleteDialog from 'components/dialogs/delete/component';
import { auth } from '@/pages/api/auth/[...nextauth]';
import getQueryClient from '@/lib/react-query';

import type { Option } from 'components/forms/select';
import type { ScenarioCardProps } from 'containers/scenarios/card/types';
import type { GetServerSideProps } from 'next';

const DISPLAY_OPTIONS: ScenarioCardProps['display'][] = ['grid', 'list'];

const displayClasses = {
  grid: 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3',
  list: 'space-y-1 mt-4 w-full',
};

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

  const [scenatioToDelete, setScenatioToDelete] = useState<string>(null);
  const onDeleteScenario = (id: string) => {
    setScenatioToDelete(id);
  };
  const deleteScenario = useDeleteScenario();
  const handleCloseDialog = useCallback(() => {
    setScenatioToDelete(null);
  }, []);

  const handleDeleteScenario = useCallback(() => {
    if (scenatioToDelete) {
      deleteScenario.mutate(scenatioToDelete, {
        onSuccess: () => {
          setScenatioToDelete(null);
          toast.success(`Scenario deleted successfully`);
        },
      });
    }
  }, [deleteScenario, scenatioToDelete]);

  const { hasPermission } = usePermissions();
  const canCreateScenario = hasPermission(Permission.CAN_CREATE_SCENARIO);
  const handleSort = useCallback(
    ({ value }: Option<string>) => {
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

  const currentSort = useMemo(
    () => SORT_OPTIONS.find(({ value }) => value === query.sortBy) || SORT_OPTIONS[0],
    [query.sortBy],
  );

  const currentDisplay = useMemo(
    () => (query.display as ScenarioCardProps['display']) || 'grid',
    [query.display],
  );

  const searchTerm = useMemo(
    () => (typeof query.search === 'string' ? query.search : null),
    [query.search],
  );

  const { data, isLoading, isFetched } = useScenarios({
    params: {
      disablePagination: true,
      sort: currentSort.value,
      include: 'user',
      ...(searchTerm && { 'search[title]': searchTerm }),
    },
    options: { select: (data) => data.data },
  });

  const thereAreScenarios = isFetched && data.length > 0;

  return (
    <AdminLayout
      title="Manage scenarios data"
      searchSection={
        <Search
          placeholder="Search by scenario name..."
          data-testid="search-name-scenario"
          className="border-none"
        />
      }
    >
      <Head>
        <title>Admin scenarios | Landgriffon</title>
      </Head>

      {(!isFetched || isLoading) && (
        <div className="flex h-full w-full items-center justify-center">
          <Loading className="h-5 w-5 text-navy-400" />
        </div>
      )}

      {!thereAreScenarios && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="space-y-8 text-center">
            <div className="m-auto h-[125px] w-[125px]">
              <Lottie animationData={newScenarioAnimation} loop autoplay />
            </div>
            <h3>Add your scenarios</h3>
            <p className="text-gray-500">Assess future scenarios on sourcing decisions.</p>
            <Anchor
              href="/data/scenarios/new"
              data-testid="scenario-add-button"
              icon={
                <div
                  aria-hidden="true"
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white"
                >
                  <PlusIcon className="h-4 w-4 fill-navy-400" />
                </div>
              }
            >
              Add scenario
            </Anchor>
          </div>
        </div>
      )}

      <div className="flex h-full  flex-1 flex-col">
        {thereAreScenarios && (
          <div className="mb-6 space-x-4">
            <div className="w-full bg-white"></div>
            <div className="flex justify-end space-x-4">
              <div className="flex space-x-2">
                <Select
                  value={currentSort}
                  options={SORT_OPTIONS}
                  onChange={handleSort}
                  icon={<SortDescendingIcon className="h-4 w-4" />}
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
                      {display === 'grid' && <GridIcon className="h-3 w-3" aria-hidden="true" />}
                      {display === 'list' && <ListIcon className="h-3 w-3" aria-hidden="true" />}
                    </LinkGroupItem>
                  ))}
                </ButtonGroup>
              </div>
              <div>
                <Anchor
                  href="/data/scenarios/new"
                  variant="secondary"
                  data-testid="scenario-add-button"
                  disabled={!canCreateScenario}
                  icon={
                    <div
                      aria-hidden="true"
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-400"
                    >
                      <PlusIcon className="h-4 w-4 text-white" />
                    </div>
                  }
                >
                  Add scenario
                </Anchor>
              </div>
            </div>
          </div>
        )}

        <div
          className={classNames('flex-1', {
            'overflow-y-auto': currentDisplay === 'list',
          })}
        >
          {thereAreScenarios &&
            (currentDisplay === 'grid' ? (
              <div className={displayClasses[currentDisplay]}>
                {!isLoading &&
                  data?.map((scenarioData) => {
                    const canDeleteScenario = hasPermission(
                      Permission.CAN_DELETE_SCENARIO,
                      scenarioData.user?.id,
                    );
                    const canEditScenario = hasPermission(
                      Permission.CAN_EDIT_SCENARIO,
                      scenarioData.user?.id,
                    );
                    return (
                      <ScenarioCard
                        key={`scenario-card-${scenarioData.id}`}
                        data={scenarioData}
                        onDelete={onDeleteScenario}
                        canDeleteScenario={canDeleteScenario}
                        canEditScenario={canEditScenario}
                      />
                    );
                  })}
              </div>
            ) : (
              <ScenarioTable data={data} onDelete={onDeleteScenario} />
            ))}
        </div>
        <DeleteDialog
          isOpen={!!scenatioToDelete}
          title="Delete Scenario"
          onDelete={handleDeleteScenario}
          onClose={handleCloseDialog}
          description="All of this scenario data will be permanently removed from our servers forever. This action cannot be undone."
        />
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    const tasks = await tasksSSR({ req, res });
    if (tasks && tasks[0]?.attributes.status === 'processing') {
      return {
        redirect: {
          permanent: false,
          destination: '/data',
        },
      };
    }
    const session = await auth(req, res);
    const queryClient = getQueryClient();

    queryClient.setQueryData(['profile', session.accessToken], session.user);

    return { props: { query, session, dehydratedState: dehydrate(queryClient) } };
  } catch (error) {
    if (error.response.status === 401) {
      return {
        redirect: {
          permanent: false,
          destination: '/auth/signin',
        },
      };
    }
  }
};

export default ScenariosAdminPage;
