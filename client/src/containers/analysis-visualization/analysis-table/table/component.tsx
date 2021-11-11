import { Table as TableAntd } from 'antd';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

export interface TableProps {
  columns: Record<string, unknown>[];
  dataSource: Array<{
    key: string;
    indicator: string;
    children?: React.ReactNode;
    [key: number]: number;
  }>;
  onChange: (pagination: unknown, filters: unknown, sorter: unknown, extra: unknown) => void;
}

export const Table: React.FC<TableProps> = ({ columns, dataSource, onChange }: TableProps) => (
  <TableAntd
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
    scroll={{ x: '110%', scrollToFirstRowOnChange: true }}
    onChange={onChange}
  />
);

export default Table;
