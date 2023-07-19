import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useDebounceCallback } from '@react-hook/debounce';
import { PlusIcon } from '@heroicons/react/solid';

import { useUsers } from 'hooks/users';
import ProfileLayout from 'layouts/profile';
import Button from 'components/button';
import Search from 'components/search';
import Table from 'components/table';
import { DEFAULT_PAGE_SIZES } from 'components/table/pagination/constants';
import UserAvatar from 'containers/user-avatar';
import { useProfile } from 'hooks/profile';
import EditUser from 'containers/edit-user';
import getUserFullName from 'utils/user-full-name';
import UserForm from 'containers/edit-user/user-form';
import Modal from 'components/modal';
import { usePermissions } from 'hooks/permissions';
import { RoleName } from 'hooks/permissions/enums';

import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { TableProps } from 'components/table/component';
import type { User } from 'types';

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState<string>('');
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

  const { data: user, isFetching: isFetchingUser } = useProfile();

  const { data, isFetching: isFetchingData } = useUsers({
    'page[size]': pagination.pageSize,
    'page[number]': pagination.pageIndex,
    sort: sortStr,
  });

  const { hasRole } = usePermissions();
  const isAdmin = hasRole(RoleName.ADMIN);

  const handleOnSearch = useDebounceCallback((searchTerm: string) => setSearch(searchTerm), 250);

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
          align: 'left',
          enableSorting: true,
          cell: ({ row }) => {
            return (
              <div className="my-6 name flex items-center gap-x-4">
                <UserAvatar
                  userFullName={getUserFullName(row.original, { replaceByEmail: true })}
                  user={row.original}
                  className="w-10 h-10 shrink-0"
                />
                {getUserFullName(row.original)}
              </div>
            );
          },
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
            <div className="pr-6 py-4">
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
    <ProfileLayout title="Users">
      <Head>
        <title>Admin users | Landgriffon</title>
      </Head>
      <div className="h-full flex flex-col">
        <div className="flex flex-col-reverse items-center justify-between mb-5 md:flex-row">
          <div className="flex w-full gap-2 md:w-auto">
            <Search placeholder="Search table" defaultValue={search} onChange={handleOnSearch} />
          </div>
          <div className="flex items-center">
            <Button
              variant="primary"
              icon={
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center w-5 h-5 bg-white rounded-full"
                >
                  <PlusIcon className="w-4 h-4 text-navy-400" />
                </div>
              }
              onClick={() => setOpenModal(true)}
              disabled={!isAdmin}
            >
              Add user
            </Button>
            <Modal size="narrow" open={openModal} title="Add user" onDismiss={closeModal}>
              <UserForm onSubmit={closeModal}>
                <div className="w-full flex justify-end mr-2.5">
                  <Button size="base" variant="white" onClick={closeModal}>
                    Cancel
                  </Button>
                </div>
              </UserForm>
            </Modal>
          </div>
        </div>
        <div className="flex-1">
          <Table {...tableProps} isLoading={isFetchingUser || isFetchingData} />
        </div>
      </div>
    </ProfileLayout>
  );
};

export default AdminUsersPage;
