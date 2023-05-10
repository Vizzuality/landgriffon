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

  const sortStr = useMemo(() => {
    return sorting.map((sort) => (sort.desc ? `-${sort.id}` : sort.id)).join(',') || null;
  }, [sorting]);

  const { data, isFetching } = useUsers({
    'page[size]': pagination.pageSize,
    'page[number]': pagination.pageIndex,
    sort: sortStr,
  });

  const handleOnSearch = useDebounceCallback((searchTerm: string) => setSearch(searchTerm), 250);

  const tableProps = useMemo<TableProps<User>>(
    () => ({
      state: { pagination, sorting },
      columns: [
        {
          id: 'displayName',
          header: 'Name',
          size: 110,
          align: 'left',
          enableSorting: true,
          cell: ({ row }) => <div className="my-6 ml-4 name">{row.original.displayName}</div>,
        },
        {
          id: 'email',
          header: 'Email',
          align: 'left',
          enableSorting: true,
        },
        {
          id: 'isActive',
          header: 'Active',
          cell: ({ row }) => (
            <div className="my-6 name">{row.original.isActive ? 'Yes' : 'No'}</div>
          ),
          align: 'left',
          enableSorting: true,
        },
      ],
      data: data?.data ?? [],
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
    [data, pagination, sorting],
  );

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
          >
            Add user
          </Button>
        </div>
      </div>
      <Table {...tableProps} isLoading={isFetching} />
    </ProfileLayout>
  );
};

export default AdminUsersPage;
