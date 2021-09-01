import { Table as TableAntd } from 'antd';

export interface TableProps {
  columns: Array<object>;
  dataSource: Array<object>;
}

export const Table: React.FC<TableProps> = ({ columns, dataSource }: TableProps) => (
  <TableAntd
    // expandable={{
    //   expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
    //   expandIcon: ({ expanded, onExpand, record }) =>
    //     expanded ? (
    //       <button type="button" onClick={(e) => onExpand(record, e)}>
    //         A
    //       </button>
    //     ) : (
    //       <button type="button" onClick={(e) => onExpand(record, e)}>
    //         B
    //       </button>
    //     ),
    // }}
    dataSource={dataSource}
    columns={columns}
    pagination={false}
    scroll={{ x: 2500 }}
  />
);

export default Table;
