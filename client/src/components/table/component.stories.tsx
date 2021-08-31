import type { Story } from '@storybook/react';
import Table, { TableProps } from './component';

export default {
  title: 'Components/Table',
  component: Table,
  argTypes: {},
};

const Template: Story<TableProps> = (props: TableProps) => <Table {...props} />;

export const Default = Template.bind({});

Default.args = {
  columns: [
    {
      title: '2021',
      dataIndex: '2021',
      key: '2021',
      width: 150,
      fixed: 'left',
    },
    {
      title: '2022',
      dataIndex: '2022',
      key: '2022',
      width: 150,
    },
    {
      title: '2023',
      dataIndex: '2023',
      key: '2023',
      width: 150,
    },
    {
      title: '2024',
      dataIndex: '2024',
      key: '2024',
      width: 150,
    },
    {
      title: '2025',
      dataIndex: '2025',
      key: '2025',
      width: 150,
    },
  ],
  dataSource: [
    {
      key: '1',
      2021: 20,
      2022: 30,
      2023: 50,
      2024: 30,
      2025: 36,
    },
    {
      key: '2',
      2021: 20,
      2022: 30,
      2023: 150,
      2024: 30,
      2025: 140,
    },
    {
      key: '3',
      2021: 200,
      2022: 30,
      2023: 150,
      2024: 32,
      2025: 36,
    },
    {
      key: '4',
      2021: 50,
      2022: 30,
      2023: 100,
      2024: 200,
      2025: 36,
    },
  ],
};
