import { useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import Component from './component';

const ScenarioItemContainer = (props) => {
  const { visualizationMode } = useAppSelector(analysisUI);
  const componentProps = {
    data: null,
    isSelected: false,
    isComparisonEnabled: false,
    ...props,
    isComparisonAvailable: visualizationMode !== 'map',
  };

  return <Component {...componentProps} />;
};

export default ScenarioItemContainer;
