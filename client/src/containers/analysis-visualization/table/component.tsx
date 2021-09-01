/* eslint-disable react/prop-types */
import { Table as TableAntd } from 'antd';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

export interface TableProps {
  columns: Array<object>;
  dataSource: Array<{
    key: string;
    commodity: string;
    children?: React.ReactNode;
    [key: number]: number;
  }>;
}

export const Table: React.FC<TableProps> = ({ columns, dataSource }: TableProps) => (
  <TableAntd
    className="w-full"
    expandable={{
      rowExpandable: (record) => !!record.children,
      expandIcon: ({ expanded, onExpand, record }) => {
        if (!record.children) return null;
        if (expanded)
          return (
            <button type="button" onClick={(e) => onExpand(record, e)}>
              <ChevronUpIcon className="w-5 h-4 mr-2 text-gray-800" />
            </button>
          );
        return (
          <button type="button" onClick={(e) => onExpand(record, e)}>
            <ChevronDownIcon className="w-5 h-4 mr-2 text-gray-800" />
          </button>
        );
      },
    }}
    dataSource={dataSource}
    columns={columns}
    pagination={false}
    scroll={{ x: 2000 }}
  />
);

export default Table;
