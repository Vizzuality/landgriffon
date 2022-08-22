import AnalysisMap from 'containers/analysis-visualization/analysis-map';
import useEffectOnce from 'hooks/once';
import AnalysisLayout from 'layouts/analysis';
import { NextSeo } from 'next-seo';
import type { NextPageWithLayout } from 'pages/_app';
import { setVisualizationMode } from 'store/features/analysis';
import { useAppDispatch } from 'store/hooks';

const MapPage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    dispatch(setVisualizationMode('map'));
  });

  return (
    <>
      <NextSeo title="Map View" />
      <AnalysisMap />
    </>
  );
};

MapPage.Layout = AnalysisLayout;

export async function getServerSideProps({ query }) {
  return { props: { query } };
}

export default MapPage;
