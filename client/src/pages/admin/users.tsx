import { useMemo } from 'react';
import { useDebounce } from '@react-hook/debounce';
import { ITableProps } from 'ka-table';
import { DataType } from 'ka-table/enums';
import dynamic from 'next/dynamic';
import { PlusIcon } from '@heroicons/react/solid';

import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import Button from 'components/button';
import Search from 'components/search';

type ITableData = ITableProps;

const TableNoSSR = dynamic(() => import('containers/table'), { ssr: false });

const AdminUsersPage: React.FC = () => {
  const [searchText, setSearchText] = useDebounce('', 250);

  const tableData = Array(100)
    .fill(undefined)
    .map((_, index) => ({
      name: `Name: ${index}`,
      email: `Email: ${index}`,
      title: `Title: ${index}`,
      role: `Role: ${index}`,
    }));

  const tableProps: ITableData = useMemo(
    () => ({
      rowKeyField: 'id',
      columns: [
        { key: 'name', title: 'Name', dataType: DataType.String, width: 110 },
        { key: 'email', title: 'Email', dataType: DataType.String },
        { key: 'title', title: 'Title', dataType: DataType.String },
        { key: 'role', title: 'Role', dataType: DataType.String },
      ],
      data: tableData,
    }),
    [tableData],
  );

  return (
    <AdminLayout currentTab={ADMIN_TABS.USERS}>
      <div className="flex flex-col-reverse md:flex-row justify-between items-center">
        <div className="flex w-full md:w-auto gap-2">
          <Search placeholder="Search table" onChange={setSearchText} />
        </div>
        <div className="flex items-center">
          <Button theme="primary" onClick={() => console.info('Add user: click')}>
            <PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
            Add user
          </Button>
        </div>
      </div>
      <TableNoSSR {...tableProps} />
    </AdminLayout>
  );
};

export default AdminUsersPage;
