import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useDebounceCallback } from '@react-hook/debounce';
import { PlusIcon } from '@heroicons/react/solid';

import { useUsers } from 'hooks/users';
import AdminLayout from 'layouts/data';
import Button from 'components/button';
import Search from 'components/search';
import Table from 'components/table';
import { DEFAULT_PAGE_SIZES } from 'components/table/pagination/constants';

import type { TableProps } from 'components/table/component';
import type { PaginationState } from '@tanstack/react-table';
import type { User } from 'types';

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZES[0],
  });

  const { data, isLoading } = useUsers({
    'page[size]': pagination.pageSize,
    'page[number]': pagination.pageIndex,
    ...(sorting[0] && {
      orderBy: sorting[0].id,
      order: sorting[0].desc ? 'desc' : 'asc',
    }),
  });

  const handleOnSearch = useDebounceCallback((searchTerm: string) => setSearch(searchTerm), 250);

  const tableProps = useMemo<TableProps<User>>(
    () => ({
      state: { pagination, sorting },
      columns: [
        { id: 'displayName', header: 'Name', size: 110 },
        { id: 'email', header: 'Email' },
        {
          id: 'isActive',
          header: 'Active',
          cell: ({ row }) => (row.original.isActive ? 'Yes' : 'No'),
        },
      ].map((column) => ({ align: 'left', ...column })),
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
    [data, pagination, sorting],
  );

  return (
    <AdminLayout>
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
          >
            Add user
          </Button>
        </div>
      </div>
      <Table {...tableProps} isLoading={isLoading} />
    </AdminLayout>
  );
};

export default AdminUsersPage;
