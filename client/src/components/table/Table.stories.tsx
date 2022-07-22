import React, { useMemo, useState } from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import initStore from 'store';

import Table from './component';
import type { TableProps } from '.';
import { Provider } from 'react-redux';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/Table',
  component: Table,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // theme: {
    //   options: ['default', 'default-bordernone', 'inline-primary'],
    //   control: { type: 'radio' },
    // },
    data: { table: { disable: true } },
    columns: { table: { disable: true } },
  },
} as ComponentMeta<typeof Table>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Table> = (args) => {
  const store = useMemo(() => initStore({}), []);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  return (
    <Provider store={store}>
      <Table
        {...args}
        pageNumber={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => setPageSize(size)}
      />
    </Provider>
  );
};

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  isLoading: false,
  data: Array(200).fill({}),
  columns: [{ key: 'column1' }, { key: 'column2' }, { key: 'column3' }],
  paging: { enabled: true, pageIndex: 0, pageSize: 10, pageSizes: [10, 20, 30, 40] },
} as Partial<TableProps>;
