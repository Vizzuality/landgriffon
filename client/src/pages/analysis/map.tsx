import AnalysisMap from 'containers/analysis-visualization/analysis-map';
import useEffectOnce from 'hooks/once';
import AnalysisLayout from 'layouts/analysis';
import type { NextPageWithLayout } from 'pages/_app';
import { setVisualizationMode } from 'store/features/analysis';
import { useAppDispatch } from 'store/hooks';
import TitleTemplate from 'utils/titleTemplate';

const MapPage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    dispatch(setVisualizationMode('map'));
  });

  return (
    <>
      <TitleTemplate title="Map View" />
      <AnalysisMap />
    </>
  );
};

MapPage.Layout = AnalysisLayout;

export async function getServerSideProps({ query }) {
  return { props: { query } };
}

export default MapPage;
