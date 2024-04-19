import { useMemo, useState } from 'react';
import Head from 'next/head';
import { PlusIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { dehydrate } from '@tanstack/react-query';

import { auth } from '@/pages/api/auth/[...nextauth]';
import { useUsers } from 'hooks/users';
import ProfileLayout from 'layouts/profile';
import Button from 'components/button';
import Search from 'components/search';
import Table from 'components/table';
import { DEFAULT_PAGE_SIZES } from 'components/table/pagination/constants';
import UserAvatar from 'containers/user-avatar';
import EditUser from 'containers/edit-user';
import getUserFullName from 'utils/user-full-name';
import { usePermissions } from 'hooks/permissions';
import { RoleName } from 'hooks/permissions/enums';
import Modal from 'components/modal';
import UserForm from 'containers/edit-user/user-form';
import getQueryClient from '@/lib/react-query';
import { useUsersControllerUserMetadata } from '@/types/generated/user';

import type { User } from 'types';
import type { TableProps } from 'components/table/component';
import type { PaginationState, SortingState } from '@tanstack/react-table';

const AdminUsersPage: React.FC = () => {
  const { query } = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZES[0],
  });
  const [openModal, setOpenModal] = useState(false);
  const closeModal = () => setOpenModal(false);

  const sortStr = useMemo(() => {
    return sorting.map((sort) => (sort.desc ? `-${sort.id}` : sort.id)).join(',') || null;
  }, [sorting]);

  const { data: user, isFetching: isFetchingUser } = useUsersControllerUserMetadata({
    query: {
      select: (data) => ({
        id: data?.data?.id,
        ...data?.data?.attributes,
      }),
    },
  });

  const searchTerm = useMemo(
    () => (typeof query.search === 'string' ? query.search : null),
    [query.search],
  );

  const { data, isFetching } = useUsers({
    'page[size]': pagination.pageSize,
    'page[number]': pagination.pageIndex,
    sort: sortStr,
    ...(searchTerm && {
      'filter[email]': searchTerm,
    }),
  });

  const { hasRole } = usePermissions();
  const isAdmin = hasRole(RoleName.ADMIN);

  const tableData = useMemo(() => {
    if (data?.data && user) {
      return data?.data?.filter(({ id }) => id !== user?.id);
    }
    return [];
  }, [data, user]);

  const tableProps = useMemo<TableProps<User>>(
    () => ({
      state: { pagination, sorting },
      columns: [
        {
          id: 'fname',
          header: 'Name',
          size: 110,
          align: 'left',
          enableSorting: true,
          cell: ({ row }) => (
            <div className="name my-6 flex items-center gap-x-4">
              <UserAvatar
                userFullName={getUserFullName(row.original, { replaceByEmail: true })}
                user={row.original}
                className="h-10 w-10"
              />
              {getUserFullName(row.original)}
            </div>
          ),
        },
        {
          id: 'email',
          header: 'Email',
          align: 'left',
          enableSorting: true,
        },
        {
          id: 'title',
          header: 'Title',
          align: 'left',
          enableSorting: true,
        },
        {
          id: 'roles',
          header: 'Role',
          cell: ({ row }) => (
            <div>
              {row.original.roles.map((role) => (
                <p className="capitalize" key={role.name}>
                  {role.name}
                </p>
              ))}
            </div>
          ),
          align: 'left',
          enableSorting: true,
        },
        {
          id: 'id',
          header: '',
          size: 100,
          align: 'right',
          cell: ({ row }) => (
            <div className="py-4 pr-6">
              <EditUser user={row.original} />
            </div>
          ),
        },
      ],
      data: tableData,
      headerTheme: 'clean',
      onPaginationChange: setPaginationState,
      onSortingChange: setSorting,
      paginationProps: {
        pageSizes: DEFAULT_PAGE_SIZES,
        pageSize: pagination.pageSize,
        currentPage: pagination.pageIndex,
        totalPages: data?.meta?.totalPages,
        totalItems: data?.meta?.totalItems,
      },
    }),
    [data, tableData, pagination, sorting],
  );

  return (
    <ProfileLayout title="Users" searchSection={<Search placeholder="Search user..." disabled />}>
      <Head>
        <title>Admin users | Landgriffon</title>
      </Head>
      <div className="flex  h-full flex-1 flex-col">
        <div className="flex-0 mb-6 flex justify-end">
          <Button
            variant="primary"
            icon={
              <div
                aria-hidden="true"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white"
              >
                <PlusIcon className="h-4 w-4 text-navy-400" />
              </div>
            }
            onClick={() => setOpenModal(true)}
            disabled={!isAdmin}
          >
            Add user
          </Button>
          <Modal size="narrow" open={openModal} title="Add user" onDismiss={closeModal}>
            <UserForm onSubmit={closeModal}>
              <div className="mr-2.5 flex w-full justify-end">
                <Button size="base" variant="white" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </UserForm>
          </Modal>
        </div>
        <div className="h-full flex-1">
          <Table {...tableProps} isLoading={isFetching || isFetchingUser} />
        </div>
      </div>
    </ProfileLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await auth(ctx.req, ctx.res);
  const queryClient = getQueryClient();

  queryClient.setQueryData(['profile', session.accessToken], session.user);

  return {
    props: {
      session,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default AdminUsersPage;
