import { Table as TableAntd } from 'antd';

export interface TableProps {
  columns: Array<object>;
  dataSource: Array<object>;
}

export const Table: React.FC<TableProps> = ({ columns, dataSource }: TableProps) => (
  <TableAntd
    dataSource={dataSource}
    columns={columns}
    pagination={false}
    scroll={{ x: 1500, y: 300 }}
  />
);

export default Table;
