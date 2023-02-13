import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useDebounceCallback } from '@react-hook/debounce';
import { PlusIcon } from '@heroicons/react/solid';
import { capitalize } from 'lodash-es';
import Image from 'next/image';

import { useUsers } from 'hooks/users';
import ProfileLayout from 'layouts/profile';
import Button from 'components/button';
import Search from 'components/search';
import Table from 'components/table';
import { DEFAULT_PAGE_SIZES } from 'components/table/pagination/constants';
import { usePermissions } from 'hooks/permissions';
import { RoleName } from 'hooks/permissions/enums';
import Modal from 'components/modal/component';
import UserForm from 'containers/user-form';
import { NEW_USER } from 'containers/user-form/helpers';

import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { TableProps } from 'components/table/component';
import type { ProfilePayload } from 'types';

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZES[0],
  });
  const [selectedUser, setOpenUserFormModal] = useState<ProfilePayload>();

  const { hasRole } = usePermissions();
  const isAdmin = hasRole(RoleName.ADMIN);

  const sortStr = useMemo(() => {
    return sorting.map((sort) => (sort.desc ? `-${sort.id}` : sort.id)).join(',') || null;
  }, [sorting]);

  const { data, isFetching } = useUsers(
    {
      'page[size]': pagination.pageSize,
      'page[number]': pagination.pageIndex,
      sort: sortStr,
    },
    {
      enabled: isAdmin,
    },
  );

  const handleOnSearch = useDebounceCallback((searchTerm: string) => setSearch(searchTerm), 250);

  const tableProps = useMemo<TableProps<ProfilePayload>>(
    () => ({
      state: { pagination, sorting },
      columns: [
        {
          id: 'fname',
          header: 'Name',
          align: 'left',
          enableSorting: true,
          cell: ({ row }) => (
            <div className="flex items-center gap-4" data-testname="user-table-row">
              <div className="flex-shrink-0 w-10 h-10 rounded-full">
                <Image
                  width={40}
                  height={40}
                  src={row.original.avatarDataUrl || '/images/avatar.png'}
                  alt="User image"
                />
              </div>
              <span>{`${row.original.fname || ''} ${row.original.lname || ''}`}</span>
            </div>
          ),
        },
        { id: 'email', header: 'Email', align: 'left', enableSorting: true },
        {
          id: 'displayName',
          header: 'Title',
          align: 'left',
          enableSorting: true,
        },
        {
          id: 'roles',
          header: 'Role',
          cell: ({ row }) => row.original.roles.map((role) => capitalize(role.name)),
          align: 'center',
          size: 150,
          enableSorting: false,
        },
        {
          id: 'edit',
          header: '',
          size: 75,
          cell: ({ row }) => (
            <Button
              variant="white"
              size="xs"
              onClick={() => setOpenUserFormModal(row.original)}
              disabled={!isAdmin}
              className="h-8"
            >
              Edit
            </Button>
          ),
        },
      ],
      data: data?.data ?? [],
      theme: 'striped',
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
    [data, pagination, sorting, isAdmin],
  );

  const modalTitle = useMemo(() => {
    if (selectedUser?.id) {
      if (selectedUser.fname || selectedUser.lname) {
        return `Edit user "${selectedUser.fname || ''}${
          selectedUser.lname ? ` ${selectedUser.lname}` : ''
        }"`;
      }
      return 'Edit user';
    }
    return 'Add user';
  }, [selectedUser]);

  return (
    <ProfileLayout title="Users">
      <Head>
        <title>Admin users | Landgriffon</title>
      </Head>
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
            disabled
            // disabled={!isAdmin} uncomment when endpoint ready
            onClick={() => setOpenUserFormModal(NEW_USER)}
          >
            Add user
          </Button>
        </div>
      </div>
      <Table {...tableProps} isLoading={isFetching} />
      <Modal
        title={modalTitle}
        open={!!selectedUser}
        onDismiss={() => setOpenUserFormModal(undefined)}
      >
        <UserForm user={selectedUser} closeUserForm={() => setOpenUserFormModal(undefined)} />
      </Modal>
    </ProfileLayout>
  );
};

export default AdminUsersPage;
