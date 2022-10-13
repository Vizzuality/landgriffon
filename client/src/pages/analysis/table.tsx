import { useAppDispatch } from 'store/hooks';
import useEffectOnce from 'hooks/once';
import { setVisualizationMode } from 'store/features/analysis';
import ApplicationLayout from 'layouts/application';
import AnalysisLayout from 'layouts/analysis';
import AnalysisTable from 'containers/analysis-visualization/analysis-table';
import TitleTemplate from 'utils/titleTemplate';

import type { NextPageWithLayout } from 'pages/_app';
import type { ReactElement } from 'react';

export const getServerSideProps = ({ query }) => {
  return { props: { query } };
};

const TablePage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    dispatch(setVisualizationMode('table'));
  });
  return (
    <>
      <TitleTemplate title="Table View" />
      <AnalysisTable />
    </>
  );
};

TablePage.Layout = function getLayout(page: ReactElement) {
  return (
    <ApplicationLayout>
      <AnalysisLayout>{page}</AnalysisLayout>
    </ApplicationLayout>
  );
};

export default TablePage;
