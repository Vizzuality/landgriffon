import AnalysisMap from 'containers/analysis-visualization/analysis-map';
import useEffectOnce from 'hooks/once';
import AnalysisLayout from 'layouts/analysis';
import type { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { setVisualizationMode } from 'store/features/analysis';
import { useAppDispatch } from 'store/hooks';

const MapPage: NextPage = () => {
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    dispatch(setVisualizationMode('map'));
  });

  return (
    <AnalysisLayout>
      <NextSeo title="Map View" />
      <AnalysisMap />
    </AnalysisLayout>
  );
};

export async function getServerSideProps({ query }) {
  return { props: { query } };
}

export default MapPage;
