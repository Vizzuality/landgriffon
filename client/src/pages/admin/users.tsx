import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useDebounce } from '@react-hook/debounce';
import { PlusIcon } from '@heroicons/react/solid';

import { useUsers } from 'hooks/users';

import AdminLayout from 'layouts/admin';
import Button from 'components/button';
import Search from 'components/search';
import Table from 'components/table';

import type { TableProps } from 'components/table/component';
import type { PaginationState } from '@tanstack/react-table';
import type { User } from 'types';

const AdminUsersPage: React.FC = () => {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 10,
  });
  const { data, isLoading } = useUsers({
    'page[size]': paginationState.pageSize,
    'page[number]': paginationState.pageIndex,
  });
  const [searchText, setSearchText] = useDebounce('', 250);

  const tableData: User[] = data?.data?.map((user) => ({
    displayName: user.displayName,
    email: user.email,
    isActive: user.isActive,
  }));

  const tableProps = useMemo<TableProps<User>>(
    () => ({
      onPaginationChange: setPaginationState,
      state: { pagination: paginationState },
      columns: [
        { id: 'displayName', header: 'Name', size: 110 },
        { id: 'email', header: 'Email' },
        {
          id: 'isActive',
          header: 'Active',
          cell: ({ row }) => (row.original.isActive ? 'Yes' : 'No'),
        },
      ].map((column) => ({ align: 'left', ...column })),
      data: tableData,
      theme: 'striped',
    }),
    [paginationState, tableData],
  );

  return (
    <AdminLayout>
      <Head>
        <title>Admin users | Landgriffon</title>
      </Head>
      <div className="flex flex-col-reverse items-center justify-between mb-5 md:flex-row">
        <div className="flex w-full gap-2 md:w-auto">
          <Search placeholder="Search table" value={searchText} onChange={setSearchText} />
        </div>
        <div className="flex items-center">
          <Button theme="primary" onClick={() => console.info('Add user: click')}>
            <PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
            Add user
          </Button>
        </div>
      </div>
      {!isLoading && tableData?.length > 0 && <Table {...tableProps} />}
    </AdminLayout>
  );
};

export default AdminUsersPage;
