import { ITableProps } from 'ka-table';
import { DataType, PagingPosition } from 'ka-table/enums';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import { PlusIcon } from '@heroicons/react/solid';

import AdminLayout, { TABS } from 'layouts/admin';
import Button from 'components/button';

type ITableData = ITableProps;

const TableNoSSR = dynamic(() => import('components/table'), { ssr: false });

const columns = [
  { key: 'name', title: 'Name', dataType: DataType.String },
  { key: 'email', title: 'Email', dataType: DataType.String },
  { key: 'title', title: 'Title', dataType: DataType.String },
  { key: 'role', title: 'Role', dataType: DataType.String },
];

const tableProps: ITableData = {
  columns,
  rowKeyField: 'id',
  paging: {
    enabled: true,
    pageIndex: 0,
    pageSize: 10,
    pageSizes: [10, 25, 50, 75, 100],
    position: PagingPosition.Bottom,
  },
};

const AdminUsersPage: React.FC = () => {
  const data = Array(100)
    .fill(undefined)
    .map((_, index) => ({
      name: `Name: ${index}`,
      email: `Email: ${index}`,
      title: `Title: ${index}`,
      role: `Role: ${index}`,
    }));

  const handleSearch = debounce(({ target }: { target: HTMLInputElement }): void => {
    console.info('Search: ', target.value);
  }, 200);

  return (
    <AdminLayout currentTab={TABS.USERS}>
      <div className="flex flex-col-reverse md:flex-row justify-between items-center">
        <div className="flex w-full md:w-auto gap-2 my-4">
          <input
            className="w-full md:w-auto bg-white border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 text-sm font-medium"
            type="search"
            placeholder="Search table"
            defaultValue=""
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center">
          <Button theme="primary" onClick={() => console.info('Add user: click')}>
            <PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
            Add user
          </Button>
        </div>
      </div>
      <TableNoSSR tablePropsInit={{ ...tableProps, data: data }} />
    </AdminLayout>
  );
};

export default AdminUsersPage;
