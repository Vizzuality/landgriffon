import { useAppSelector } from 'store/hooks';
import { visualizationMode } from 'store/features/analysis';
import Component from './component';

const ScenarioItemContainer = (props) => {
  const mode = useAppSelector(visualizationMode);
  const componentProps = {
    data: null,
    isSelected: false,
    isComparisonEnabled: false,
    ...props,
    isComparisonAvailable: mode !== 'map',
  };

  return <Component {...componentProps} />;
};

export default ScenarioItemContainer;
